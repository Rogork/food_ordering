import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  imports: [],
  template: `
    <div class="loading-container" [attr.aria-label]="message()">
      <div class="loading-spinner" role="status" aria-hidden="true"></div>
      <p class="loading-message">{{ message() }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .loading-spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid rgba(251, 146, 60, 0.2);
      border-top: 3px solid rgb(251, 146, 60);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .loading-message {
      color: rgb(156, 163, 175);
      font-size: 0.875rem;
      margin: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingState {
  message = input('Loading orders...');
}
