import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, timer } from 'rxjs';
import { SseService } from '../../core/services/sse.service';
import { environment } from '../../../environments/environment';
import { ExternalLinkDirective } from '../../core/directives/external-link.directive';

const LOGIN_TIMEOUT_MS = 120_000;
const LOGIN_TIMEOUT_SECONDS = LOGIN_TIMEOUT_MS / 1000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    QRCodeComponent,
    TranslateModule,
    ExternalLinkDirective,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('timeoutMsg') timeoutMsg?: ElementRef;
  @ViewChild('errorMsg') errorMsg?: ElementRef;

  authRequest = '';
  state = '';
  homeUri = '';
  timedOut = false;
  errorMessage = '';
  sameDevice = false;
  copied = false;
  waitingForVerification = false;
  showSuccess = false;
  mobileMenuOpen = false;
  marketplaceDropdownOpen = false;
  remainingSeconds: number = LOGIN_TIMEOUT_SECONDS;
  countdownPercentage: number = 100;

  private sseSub?: Subscription;
  private timerSub?: Subscription;
  private countdownInterval?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private sseService: SseService,
  ) {}

  ngOnInit(): void {
    this.authRequest =
      this.route.snapshot.queryParamMap.get('authRequest') ?? '';
    this.state = this.route.snapshot.queryParamMap.get('state') ?? '';

    // if (!this.state && !environment.production) {
    //   this.state = 'dev-mock-state'; // TODO: remove (dev only)
    // }
    // this.homeUri = this.route.snapshot.queryParamMap.get('homeUri') ?? '';
    // if (!this.homeUri && !environment.production) {
    //   this.homeUri = 'https://dome-marketplace.eu'; // TODO: remove (dev only)
    // }

    // this.authRequest =
    //   this.route.snapshot.queryParamMap.get('authRequest') ?? '';
    // if (!this.authRequest && !environment.production) {
    //   this.authRequest =
    //     'openid4vp://authorize?response_type=vp_token&client_id=dev-mock&nonce=abc123';
    // }
    // this.state = this.route.snapshot.queryParamMap.get('state') ?? '';
    // if (!this.state && !environment.production) {
    //   this.state = 'dev-mock-state';
    // }

    if (this.state) {
      this.waitingForVerification = true;

      this.sseSub = this.sseService.connect(this.state).subscribe({
        next: (redirectUrl) => {
          this.waitingForVerification = false;
          this.showSuccess = true;
          this.clearCountdown();
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 800);
        },
        error: () => {
          this.waitingForVerification = false;
          this.errorMessage = 'login.error';
          this.clearCountdown();
          setTimeout(() => this.errorMsg?.nativeElement.focus());
        },
      });

      this.startCountdown();

      this.timerSub = timer(LOGIN_TIMEOUT_MS).subscribe(() => {
        this.waitingForVerification = false;
        this.timedOut = true;
        this.clearCountdown();
        this.sseSub?.unsubscribe();
        setTimeout(() => this.timeoutMsg?.nativeElement.focus());
        if (this.homeUri) {
          window.location.href = this.homeUri;
          // console.log('OK');
        }
      });
    }
  }

  get walletRedirectUrl(): string {
    const walletUrl = environment.walletUrl;
    if (!this.authRequest || !walletUrl) return '';
    const base = walletUrl.replace(/\/+$/, '');
    return `${base}/protocol/callback?authorization_request=${encodeURIComponent(this.authRequest)}`;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleMarketplaceDropdown(): void {
    this.marketplaceDropdownOpen = !this.marketplaceDropdownOpen;
  }

  copyAuthRequest(): void {
    if (!this.authRequest) return;
    navigator.clipboard
      .writeText(this.authRequest)
      .then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy', err);
      });
  }

  // toggleSameDevice(): void {
  //   this.sameDevice = !this.sameDevice;
  // }

  // navigateHome(): void {
  //   if (this.homeUri) {
  //     window.location.href = this.homeUri;
  //   }
  // }
  //

  // openWallet(): void {
  //   if (!this.walletRedirectUrl) return;
  //   const opened = window.open(this.walletRedirectUrl, '_blank');
  //   if (!opened) {
  //     window.location.href = this.walletRedirectUrl;
  //   }
  // }

  private startCountdown(): void {
    this.remainingSeconds = LOGIN_TIMEOUT_SECONDS;
    this.countdownPercentage = 100;
    this.countdownInterval = setInterval(() => {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
      this.countdownPercentage =
        (this.remainingSeconds / LOGIN_TIMEOUT_SECONDS) * 100;
      // console.log(`[countdown] ${this.remainingSeconds}s remaining`); // TODO: remove (dev only)
      if (this.remainingSeconds <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
    this.timerSub?.unsubscribe();
    this.clearCountdown();
  }
}
