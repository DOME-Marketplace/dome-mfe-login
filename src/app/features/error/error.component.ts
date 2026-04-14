import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  errorCode = '';
  errorMessage = '';
  clientUrl = '';
  originalRequestURL = '';
  copied = false;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.errorCode = params.get('errorCode') ?? '';
    this.errorMessage = params.get('errorMessage') ?? '';
    this.clientUrl = params.get('clientUrl') ?? '';
    this.originalRequestURL = params.get('originalRequestURL') ?? '';
  }

  copyDetails(): void {
    const text = [
      `Error Code: ${this.errorCode}`,
      `Message: ${this.errorMessage}`,
      `Client URL: ${this.clientUrl}`,
      `Request URL: ${this.originalRequestURL}`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}
