import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  TuiButton,
  TuiIcon,
  TuiLabel,
  tuiLoaderOptionsProvider,
  TuiTextfield,
} from '@taiga-ui/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import _ from 'lodash';
import { AuthService } from '../auth-service';
import { Router } from '@angular/router';
import { TuiButtonLoading } from '@taiga-ui/kit';

@Component({
  selector: 'app-landing-auth',
  imports: [TuiButton, TuiButtonLoading, TuiTextfield, TuiLabel, TuiIcon, ReactiveFormsModule],
  templateUrl: './landing-auth.html',
  styleUrl: './landing-auth.less',
  providers: [
    tuiLoaderOptionsProvider({
      size: 'l',
      inheritColor: false,
      overlay: true,
    }),
  ],
})
export class LandingAuth {
  // properties
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly step = signal<'email' | 'password'>('email');
  readonly exists = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly errorMsg = signal<string | null>(null);

  public readonly emailForm = this.fb.group({
    email: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
      ],
    }),
  });

  readonly passwordForm = this.fb.group({
    password: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  readonly status = computed(() => ({
    loading: this.loading(),
    error: this.errorMsg(),
  }));

  constructor(private authService: AuthService) {
    effect(() => {
      if (this.step() === 'email') {
        this.passwordForm.reset();
        this.errorMsg.set(null);
      }
    });
  }

  onEmailSubmit(): void {
    if (this.emailForm.invalid || this.loading()) return;
    const email = _.trim(this.emailForm.controls.email.value as string);
    this.loading.set(true);
    this.authService.emailExists(email).subscribe({
      next: (exists) => {
        this.exists.set(exists);
        this.step.set('password');
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.message ?? 'Something went wrong');
        this.loading.set(false);
      },
    });
  }

  goBackToEmail(): void {
    this.step.set('email');
    this.emailForm.reset();
  }

  onForgot(): void {
    this.errorMsg.set('Password reset flow not yet implemented.');
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid || this.loading()) return;

    const email = _.trim(this.emailForm.controls.email.value as string);
    const password = this.passwordForm.controls.password.value as string;

    this.loading.set(true);
    (this.exists() ? this.authService.login(email, password) : this.authService.register(email, password)).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: { message: any }) => {
        this.loading.set(false);
        this.errorMsg.set(err?.message ?? 'Authentication failed');
        this.passwordForm.controls.password.setErrors({ server: true });
      },
    });
  }
}
