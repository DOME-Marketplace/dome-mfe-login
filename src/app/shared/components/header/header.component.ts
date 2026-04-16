import {
  Component,
  HostListener,
  ElementRef,
  input,
  viewChild,
  inject,
} from '@angular/core';
import { ExternalLinkDirective } from '../../../core/directives/external-link.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ExternalLinkDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  // Inputs
  homeUri = input('');

  // View queries
  dropdownWrap = viewChild<ElementRef>('dropdownWrap');

  // Public state
  mobileMenuOpen = false;
  marketplaceDropdownOpen = false;

  // Private state
  private el = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.mobileMenuOpen && !this.marketplaceDropdownOpen) return;

    if (
      this.marketplaceDropdownOpen &&
      !this.dropdownWrap()?.nativeElement.contains(event.target)
    ) {
      this.marketplaceDropdownOpen = false;
    }

    if (this.mobileMenuOpen && !this.el.nativeElement.contains(event.target)) {
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleMarketplaceDropdown(): void {
    this.marketplaceDropdownOpen = !this.marketplaceDropdownOpen;
  }
}