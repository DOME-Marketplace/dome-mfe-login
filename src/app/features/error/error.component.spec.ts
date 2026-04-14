import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  function createComponent(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [ErrorComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(queryParams)
            }
          }
        }
      ]
    });

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    fixture?.destroy();
    jest.restoreAllMocks();
  });

  describe('ngOnInit', () => {
    it('should read all query params', () => {
      createComponent({
        errorCode: '403',
        errorMessage: 'Forbidden',
        clientUrl: 'https://client.example.com',
        originalRequestURL: 'https://verifier.example.com/auth'
      });
      fixture.detectChanges();

      expect(component.errorCode).toBe('403');
      expect(component.errorMessage).toBe('Forbidden');
      expect(component.clientUrl).toBe('https://client.example.com');
      expect(component.originalRequestURL).toBe('https://verifier.example.com/auth');
    });

    it('should default to empty strings when query params are missing', () => {
      createComponent({});
      fixture.detectChanges();

      expect(component.errorCode).toBe('');
      expect(component.errorMessage).toBe('');
      expect(component.clientUrl).toBe('');
      expect(component.originalRequestURL).toBe('');
    });
  });

  describe('copyDetails', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
      });
    });

    it('should copy formatted error details to clipboard', () => {
      createComponent({
        errorCode: '500',
        errorMessage: 'Internal Server Error',
        clientUrl: 'https://client.example.com',
        originalRequestURL: 'https://verifier.example.com/auth'
      });
      fixture.detectChanges();

      component.copyDetails();

      const expected = [
        'Error Code: 500',
        'Message: Internal Server Error',
        'Client URL: https://client.example.com',
        'Request URL: https://verifier.example.com/auth'
      ].join('\n');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
    });

    it('should set copied to true then reset after 2 seconds', fakeAsync(() => {
      createComponent({ errorCode: '404' });
      fixture.detectChanges();

      expect(component.copied).toBe(false);

      component.copyDetails();
      tick();
      expect(component.copied).toBe(true);

      tick(2000);
      expect(component.copied).toBe(false);
    }));

    it('should handle empty fields gracefully', () => {
      createComponent({});
      fixture.detectChanges();

      component.copyDetails();

      const expected = [
        'Error Code: ',
        'Message: ',
        'Client URL: ',
        'Request URL: '
      ].join('\n');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
    });
  });

  describe('template', () => {
    it('should show error icon', () => {
      createComponent({ errorCode: '500' });
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.error-icon');
      expect(icon).toBeTruthy();
    });

    it('should show details section when errorCode is present', () => {
      createComponent({ errorCode: '403' });
      fixture.detectChanges();

      const details = fixture.nativeElement.querySelector('.details');
      expect(details).toBeTruthy();
    });

    it('should hide details section when no errorCode or errorMessage', () => {
      createComponent({});
      fixture.detectChanges();

      const details = fixture.nativeElement.querySelector('.details');
      expect(details).toBeNull();
    });

    it('should show back button when clientUrl is present', () => {
      createComponent({ clientUrl: 'https://client.example.com' });
      fixture.detectChanges();

      const backButton = fixture.nativeElement.querySelector('.back-button');
      expect(backButton).toBeTruthy();
      expect(backButton.getAttribute('href')).toBe('https://client.example.com');
    });

    it('should hide back button when clientUrl is empty', () => {
      createComponent({});
      fixture.detectChanges();

      const backButton = fixture.nativeElement.querySelector('.back-button');
      expect(backButton).toBeNull();
    });

    it('should show hardcoded DOME links', () => {
      createComponent({});
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('.theme-link');
      expect(links.length).toBe(2);
      expect(links[0].getAttribute('href')).toBe('https://dome-marketplace.eu/register');
      expect(links[1].getAttribute('href')).toBe('https://dome-marketplace.eu/support');
    });

    it('should show copy button', () => {
      createComponent({});
      fixture.detectChanges();

      const copyButton = fixture.nativeElement.querySelector('.copy-button');
      expect(copyButton).toBeTruthy();
    });

    it('should show originalRequestURL when present', () => {
      createComponent({
        errorCode: '500',
        originalRequestURL: 'https://verifier.example.com/auth'
      });
      fixture.detectChanges();

      const urlValues = fixture.nativeElement.querySelectorAll('.value.url');
      expect(urlValues.length).toBeGreaterThan(0);
    });
  });
});
