import { Directive, ElementRef, OnInit, Renderer2, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: 'a[target="_blank"]',
  standalone: true,
})
export class ExternalLinkDirective implements OnInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);

  ngOnInit(): void {
    this.translate.get('common.external-link').subscribe((label: string) => {
      const span = this.renderer.createElement('span');
      this.renderer.addClass(span, 'sr-only');
      const text = this.renderer.createText(label);
      this.renderer.appendChild(span, text);
      this.renderer.appendChild(this.el.nativeElement, span);
    });
  }
}
