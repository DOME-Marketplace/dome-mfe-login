import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  function createComponent(homeUri?: string) {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    if (homeUri !== undefined) {
      fixture.componentRef.setInput('homeUri', homeUri);
    }
    fixture.detectChanges();
  }

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have mobileMenuOpen as false', () => {
      createComponent();
      expect((component as any).mobileMenuOpen()).toBe(false);
    });

    it('should have marketplaceDropdownOpen as false', () => {
      createComponent();
      expect((component as any).marketplaceDropdownOpen()).toBe(false);
    });
  });

  describe('toggleMobileMenu', () => {
    it('should open mobile menu', () => {
      createComponent();
      (component as any).toggleMobileMenu();
      expect((component as any).mobileMenuOpen()).toBe(true);
    });

    it('should close mobile menu when called again', () => {
      createComponent();
      (component as any).toggleMobileMenu();
      (component as any).toggleMobileMenu();
      expect((component as any).mobileMenuOpen()).toBe(false);
    });
  });

  describe('toggleMarketplaceDropdown', () => {
    it('should open dropdown', () => {
      createComponent();
      (component as any).toggleMarketplaceDropdown();
      expect((component as any).marketplaceDropdownOpen()).toBe(true);
    });

    it('should close dropdown when called again', () => {
      createComponent();
      (component as any).toggleMarketplaceDropdown();
      (component as any).toggleMarketplaceDropdown();
      expect((component as any).marketplaceDropdownOpen()).toBe(false);
    });
  });

  describe('onDocumentClick', () => {
    let outsideEl: HTMLElement;

    beforeEach(() => {
      outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);
    });

    afterEach(() => {
      document.body.removeChild(outsideEl);
    });

    it('should do nothing when both menus are closed', () => {
      createComponent();
      outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect((component as any).mobileMenuOpen()).toBe(false);
      expect((component as any).marketplaceDropdownOpen()).toBe(false);
    });

    it('should close mobile menu when clicking outside the component', () => {
      createComponent();
      (component as any).toggleMobileMenu();
      fixture.detectChanges();

      outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect((component as any).mobileMenuOpen()).toBe(false);
    });

    it('should not close mobile menu when clicking inside the component', () => {
      createComponent();
      (component as any).toggleMobileMenu();
      fixture.detectChanges();

      fixture.nativeElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect((component as any).mobileMenuOpen()).toBe(true);
    });

    it('should close dropdown when clicking outside the dropdown', () => {
      createComponent();
      (component as any).toggleMarketplaceDropdown();
      fixture.detectChanges();

      outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect((component as any).marketplaceDropdownOpen()).toBe(false);
    });

    it('should not close dropdown when clicking inside the dropdown', () => {
      createComponent();
      (component as any).toggleMarketplaceDropdown();
      fixture.detectChanges();

      const dropdownWrap = fixture.nativeElement.querySelector('.header-nav-dropdown-wrap');
      dropdownWrap.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect((component as any).marketplaceDropdownOpen()).toBe(true);
    });
  });

  describe('template', () => {
    describe('hamburger button', () => {
      it('should have aria-expanded false when mobile menu is closed', () => {
        createComponent();
        const btn = fixture.nativeElement.querySelector('.header-hamburger');
        expect(btn.getAttribute('aria-expanded')).toBe('false');
      });

      it('should have aria-label "Open menu" when mobile menu is closed', () => {
        createComponent();
        const btn = fixture.nativeElement.querySelector('.header-hamburger');
        expect(btn.getAttribute('aria-label')).toBe('Open menu');
      });

      it('should have aria-expanded true and aria-label "Close menu" when mobile menu is open', () => {
        createComponent();
        (component as any).toggleMobileMenu();
        fixture.detectChanges();

        const btn = fixture.nativeElement.querySelector('.header-hamburger');
        expect(btn.getAttribute('aria-expanded')).toBe('true');
        expect(btn.getAttribute('aria-label')).toBe('Close menu');
      });
    });

    describe('mobile menu', () => {
      it('should not have is-open class initially', () => {
        createComponent();
        const menu = fixture.nativeElement.querySelector('.header-mobile-menu');
        expect(menu.classList.contains('is-open')).toBe(false);
      });

      it('should have is-open class when open', () => {
        createComponent();
        (component as any).toggleMobileMenu();
        fixture.detectChanges();

        const menu = fixture.nativeElement.querySelector('.header-mobile-menu');
        expect(menu.classList.contains('is-open')).toBe(true);
      });

      it('should set aria-hidden false when open', () => {
        createComponent();
        (component as any).toggleMobileMenu();
        fixture.detectChanges();

        const menu = fixture.nativeElement.querySelector('.header-mobile-menu');
        expect(menu.getAttribute('aria-hidden')).toBe('false');
      });
    });

    describe('marketplace dropdown', () => {
      it('should not have is-open class initially', () => {
        createComponent();
        const menu = fixture.nativeElement.querySelector('.header-nav-dropdown-menu');
        expect(menu.classList.contains('is-open')).toBe(false);
      });

      it('should have is-open class when open', () => {
        createComponent();
        (component as any).toggleMarketplaceDropdown();
        fixture.detectChanges();

        const menu = fixture.nativeElement.querySelector('.header-nav-dropdown-menu');
        expect(menu.classList.contains('is-open')).toBe(true);
      });

      it('should update aria-expanded on trigger button when open', () => {
        createComponent();
        (component as any).toggleMarketplaceDropdown();
        fixture.detectChanges();

        const trigger = fixture.nativeElement.querySelector('.header-nav-dropdown-trigger');
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
      });
    });

    describe('homeUri input', () => {
      it('should use # for logo href when homeUri is empty', () => {
        createComponent('');
        const logo = fixture.nativeElement.querySelector('.header-logo');
        expect(logo.getAttribute('href')).toBe('#');
      });

      it('should use homeUri for logo href', () => {
        createComponent('https://example.com');
        const logo = fixture.nativeElement.querySelector('.header-logo');
        expect(logo.getAttribute('href')).toBe('https://example.com');
      });

      it('should build nav links from homeUri', () => {
        createComponent('https://example.com');
        const links = fixture.nativeElement.querySelectorAll('.header-nav-link[href]');
        const hrefs = Array.from(links).map((l: any) => l.getAttribute('href'));
        expect(hrefs).toContain('https://example.com/landing-page/customers');
        expect(hrefs).toContain('https://example.com/landing-page/providers');
      });
    });
  });
});
