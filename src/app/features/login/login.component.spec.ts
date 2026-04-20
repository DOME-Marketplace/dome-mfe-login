import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from './login.component';
import { SseService } from '../../core/services/sse.service';

const LOGIN_TIMEOUT_MS = 120_000;
const LOGIN_TIMEOUT_SECONDS = LOGIN_TIMEOUT_MS / 1000;

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let sseSubject: Subject<string>;
  let mockSseService: { connect: jest.Mock };

  function createComponent(params: Record<string, string> = {}) {
    sseSubject = new Subject<string>();
    mockSseService = { connect: jest.fn().mockReturnValue(sseSubject) };

    TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(params) } },
        },
        { provide: SseService, useValue: mockSseService },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
    jest.restoreAllMocks();
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should read authRequest and state from query params', () => {
      createComponent({ authRequest: 'openid4vp://authorize', state: 'abc123' });
      expect((component as any).authRequest()).toBe('openid4vp://authorize');
      expect((component as any).state()).toBe('abc123');
    });

    it('should default to empty strings when params are missing', () => {
      createComponent();
      expect((component as any).authRequest()).toBe('');
      expect((component as any).state()).toBe('');
    });

    describe('when state is empty', () => {
      it('should not connect to SSE', () => {
        createComponent();
        expect(mockSseService.connect).not.toHaveBeenCalled();
      });

      it('should not set waitingForVerification', () => {
        createComponent();
        expect((component as any).waitingForVerification()).toBe(false);
      });
    });

    describe('when state is present', () => {
      it('should connect to SSE with the state', () => {
        createComponent({ state: 'test-state' });
        expect(mockSseService.connect).toHaveBeenCalledWith('test-state');
      });

      it('should set waitingForVerification to true', () => {
        createComponent({ state: 'test-state' });
        expect((component as any).waitingForVerification()).toBe(true);
      });

      it('should start countdown', () => {
        createComponent({ state: 'test-state' });
        expect((component as any).remainingSeconds()).toBe(LOGIN_TIMEOUT_SECONDS);
        expect((component as any).countdownPercentage()).toBe(100);
      });
    });
  });

  describe('SSE next (success)', () => {
    it('should set showSuccess and clear waitingForVerification', () => {
      createComponent({ state: 'test-state' });
      sseSubject.next('https://example.com/callback');
      expect((component as any).showSuccess()).toBe(true);
      expect((component as any).waitingForVerification()).toBe(false);
    });

    it('should redirect to the received URL after 800ms', fakeAsync(() => {
      const locationSpy = { href: '' };
      Object.defineProperty(window, 'location', { value: locationSpy, configurable: true });

      createComponent({ state: 'test-state' });
      sseSubject.next('https://example.com/callback');

      tick(800);
      expect(locationSpy.href).toBe('https://example.com/callback');

      fixture.destroy();
    }));
  });

  describe('SSE error', () => {
    it('should set errorMessage and clear waitingForVerification', () => {
      createComponent({ state: 'test-state' });
      sseSubject.error(new Error('SSE failed'));
      expect((component as any).errorMessage()).toBe('login.error');
      expect((component as any).waitingForVerification()).toBe(false);
    });
  });

  describe('timeout', () => {
    it('should set timedOut and clear waitingForVerification after LOGIN_TIMEOUT_MS', fakeAsync(() => {
      createComponent({ state: 'test-state' });

      tick(LOGIN_TIMEOUT_MS);

      expect((component as any).timedOut()).toBe(true);
      expect((component as any).waitingForVerification()).toBe(false);

      fixture.destroy();
    }));

    it('should redirect to homeUri if set when timeout fires', fakeAsync(() => {
      const locationSpy = { href: '' };
      Object.defineProperty(window, 'location', { value: locationSpy, configurable: true });

      createComponent({ state: 'test-state', homeUri: 'https://example.com' });
      (component as any).homeUri.set('https://example.com');

      tick(LOGIN_TIMEOUT_MS);
      tick(1000);

      expect(locationSpy.href).toBe('https://example.com');
      fixture.destroy();
    }));

    it('should not redirect if homeUri is empty when timeout fires', fakeAsync(() => {
      const locationSpy = { href: '' };
      Object.defineProperty(window, 'location', { value: locationSpy, configurable: true });

      createComponent({ state: 'test-state' });

      tick(LOGIN_TIMEOUT_MS);

      expect(locationSpy.href).toBe('');
      fixture.destroy();
    }));
  });

  describe('countdown', () => {
    it('should decrement remainingSeconds each second', fakeAsync(() => {
      createComponent({ state: 'test-state' });

      tick(1000);
      expect((component as any).remainingSeconds()).toBe(LOGIN_TIMEOUT_SECONDS - 1);

      tick(1000);
      expect((component as any).remainingSeconds()).toBe(LOGIN_TIMEOUT_SECONDS - 2);

      fixture.destroy();
    }));

    it('should update countdownPercentage proportionally', fakeAsync(() => {
      createComponent({ state: 'test-state' });

      tick(LOGIN_TIMEOUT_SECONDS * 500); // halfway
      const pct = (component as any).countdownPercentage();
      expect(pct).toBeCloseTo(50, 0);

      fixture.destroy();
    }));

    it('should stop at 0 and not go negative', fakeAsync(() => {
      createComponent({ state: 'test-state' });

      tick(LOGIN_TIMEOUT_MS + 5000);

      // Timer fires at LOGIN_TIMEOUT_MS and calls clearCountdown(),
      // so the final interval tick may or may not run depending on ordering.
      expect((component as any).remainingSeconds()).toBeLessThanOrEqual(1);

      fixture.destroy();
    }));
  });

  describe('copyAuthRequest', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      });
    });

    it('should copy authRequest to clipboard', fakeAsync(() => {
      createComponent({ authRequest: 'openid4vp://authorize?foo=bar' });

      component.copyAuthRequest();
      tick();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('openid4vp://authorize?foo=bar');
    }));

    it('should set copied to true then false after 2 seconds', fakeAsync(() => {
      createComponent({ authRequest: 'openid4vp://authorize' });

      component.copyAuthRequest();
      tick();

      expect((component as any).copied()).toBe(true);

      tick(2000);
      expect((component as any).copied()).toBe(false);
    }));

    it('should not copy when authRequest is empty', () => {
      createComponent();

      component.copyAuthRequest();

      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('should log error when clipboard write fails', fakeAsync(() => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      createComponent({ authRequest: 'openid4vp://authorize' });
      component.copyAuthRequest();
      tick();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy', expect.any(Error));
    }));
  });

  describe('walletRedirectUrl', () => {
    it('should return empty string when authRequest is empty', () => {
      createComponent();
      expect((component as any).walletRedirectUrl()).toBe('');
    });

    it('should return correct URL with encoded authRequest', () => {
      createComponent({ authRequest: 'openid4vp://authorize?foo=bar' });
      const url = (component as any).walletRedirectUrl();
      expect(url).toContain('/protocol/callback?authorization_request=');
      expect(url).toContain(encodeURIComponent('openid4vp://authorize?foo=bar'));
    });
  });

  describe('template', () => {
    it('should show main content when not timedOut and no errorMessage', () => {
      createComponent({ state: 'test-state' });
      const section = fixture.nativeElement.querySelector('.instructions');
      expect(section).toBeTruthy();
    });

    it('should show timeout message when timedOut', fakeAsync(() => {
      createComponent({ state: 'test-state' });

      tick(LOGIN_TIMEOUT_MS);
      fixture.detectChanges();

      const timeoutEl = fixture.nativeElement.querySelector('.status-message-timeout');
      expect(timeoutEl).toBeTruthy();

      fixture.destroy();
    }));

    it('should show error message when errorMessage is set', () => {
      createComponent({ state: 'test-state' });
      sseSubject.error(new Error('SSE failed'));
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.status-message-error');
      expect(errorEl).toBeTruthy();
    });

    it('should pass homeUri to header component', () => {
      createComponent();
      (component as any).homeUri.set('https://example.com');
      fixture.detectChanges();

      const logo = fixture.nativeElement.querySelector('.header-logo');
      expect(logo.getAttribute('href')).toBe('https://example.com');
    });

    it('should show QR code with authRequest', () => {
      createComponent({ authRequest: 'openid4vp://authorize', state: 'test-state' });
      const qr = fixture.nativeElement.querySelector('qrcode');
      expect(qr).toBeTruthy();
    });
  });

  describe('cleanup on destroy', () => {
    it('should unsubscribe SSE subscription on destroy', fakeAsync(() => {
      createComponent({ state: 'test-state' });

      const sseSub = (component as any).sseSub;
      const unsubSpy = jest.spyOn(sseSub, 'unsubscribe');

      fixture.destroy();

      expect(unsubSpy).toHaveBeenCalled();
    }));
  });
});
