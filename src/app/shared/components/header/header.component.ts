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
import { TranslateModule } from '@ngx-translate/core';
import { ExternalLinkDirective } from '../../../core/directives/external-link.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ExternalLinkDirective, NgIconComponent, TranslateModule],
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

    const target = event.target as Node | null;
    
    if (
      this.marketplaceDropdownOpen() &&
      !this.dropdownWrap()?.nativeElement.contains(target)
    ) {
      this.marketplaceDropdownOpen.set(false);
    }

    if (
      this.mobileMenuOpen() &&
      !this.el.nativeElement.contains(target)
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