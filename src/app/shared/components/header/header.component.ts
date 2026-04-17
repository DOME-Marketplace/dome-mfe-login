import {
  Component,
  HostListener,
  ElementRef,
  input,
  viewChild,
  inject,
  signal,
} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroBars3, heroXMark } from '@ng-icons/heroicons/outline';
import { ExternalLinkDirective } from '../../../core/directives/external-link.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ExternalLinkDirective, NgIconComponent],
  providers: [provideIcons({ heroBars3, heroXMark })],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly homeUri = input('');
  readonly dropdownWrap = viewChild<ElementRef>('dropdownWrap');

  // service injection
  private readonly el = inject(ElementRef);

  // Signals
  protected readonly mobileMenuOpen = signal(false);
  protected readonly marketplaceDropdownOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.mobileMenuOpen() && !this.marketplaceDropdownOpen()) return;

    if (
      this.marketplaceDropdownOpen() &&
      !this.dropdownWrap()?.nativeElement.contains(event.target)
    ) {
      this.marketplaceDropdownOpen.set(false);
    }

    if (
      this.mobileMenuOpen() &&
      !this.el.nativeElement.contains(event.target)
    ) {
      this.mobileMenuOpen.set(false);
    }
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  protected toggleMarketplaceDropdown(): void {
    this.marketplaceDropdownOpen.update((v) => !v);
  }
}