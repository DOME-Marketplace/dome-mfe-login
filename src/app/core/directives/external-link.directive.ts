import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

/**
 * Automatically appends a visually hidden ", opens in new tab" label
 * to every <a target="_blank"> for screen reader accessibility.
 *
 * Usage: just add target="_blank" — no extra markup needed.
 */
@Directive({
  selector: 'a[target="_blank"]',
  standalone: true,
})
export class ExternalLinkDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const span = this.renderer.createElement('span');
    this.renderer.addClass(span, 'sr-only');
    const text = this.renderer.createText(', opens in new tab');
    this.renderer.appendChild(span, text);
    this.renderer.appendChild(this.el.nativeElement, span);
  }
}
