import {
  Component,
  OnInit,
  ElementRef,
  viewChild,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, fromEvent, timer } from 'rxjs';
import { SseService } from '../../core/services/sse.service';
import { environment } from '../../../environments/environment';
import { ExternalLinkDirective } from '../../core/directives/external-link.directive';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroWallet,
  heroQrCode,
  heroUser,
  heroCheck,
  heroCheckCircle,
  heroArrowUpRight,
  heroEnvelope,
} from '@ng-icons/heroicons/outline';
import { heroSquare2StackSolid } from '@ng-icons/heroicons/solid';

const LOGIN_TIMEOUT_MS = 120_000;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    QRCodeComponent,
    TranslateModule,
    ExternalLinkDirective,
    HeaderComponent,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      heroWallet,
      heroQrCode,
      heroUser,
      heroCheck,
      heroCheckCircle,
      heroArrowUpRight,
      heroEnvelope,
      heroSquare2StackSolid,
    }),
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // View children
  readonly timeoutMsg = viewChild<ElementRef>('timeoutMsg');
  readonly errorMsg = viewChild<ElementRef>('errorMsg');

  // service injection
  private readonly route = inject(ActivatedRoute);
  private readonly sseService = inject(SseService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals
  protected readonly authRequest = signal('');
  protected readonly state = signal('');
  protected readonly homeUri = signal('');
  protected readonly timedOut = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly copied = signal(false);
  protected readonly waitingForVerification = signal(false);
  protected readonly showSuccess = signal(false);

  // Private state
  private sseSub?: Subscription;

  // Computed signals
  readonly walletRedirectUrl = computed(() => {
    const walletUrl = environment.walletUrl;
    if (!this.authRequest() || !walletUrl) return '';
    const base = walletUrl.replace(/\/+$/, '');
    return `${base}/protocol/callback?authorization_request=${encodeURIComponent(this.authRequest())}`;
  });

  ngOnInit(): void {
    fromEvent<PageTransitionEvent>(window, 'pageshow')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.persisted) {
          window.location.reload();
        }
      });

    this.authRequest.set(
      this.route.snapshot.queryParamMap.get('authRequest') ?? '',
    );
    this.state.set(this.route.snapshot.queryParamMap.get('state') ?? '');
    this.homeUri.set(this.route.snapshot.queryParamMap.get('homeUri') ?? '');

    if (this.state()) {
      this.waitingForVerification.set(true);

      this.sseSub = this.sseService.connect(this.state()).subscribe({
        next: (redirectUrl) => {
          this.waitingForVerification.set(false);
          this.showSuccess.set(true);
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 800);
        },
        error: () => {
          this.waitingForVerification.set(false);
          this.errorMessage.set('login.error');
          setTimeout(() => this.errorMsg()?.nativeElement.focus());
        },
      });

      timer(LOGIN_TIMEOUT_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.waitingForVerification.set(false);
          this.timedOut.set(true);
          this.sseSub?.unsubscribe();
          setTimeout(() => this.timeoutMsg()?.nativeElement.focus());
          if (this.homeUri()) {
            setTimeout(() => {
              window.location.href = this.homeUri();
            }, 800);
          }
        });
    }

    this.destroyRef.onDestroy(() => {
      this.sseSub?.unsubscribe();
    });
  }

  copyAuthRequest(): void {
    if (!this.authRequest()) return;
    navigator.clipboard
      .writeText(this.authRequest())
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy', err);
      });
  }
}
