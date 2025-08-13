import { Component, computed, effect, signal } from '@angular/core';
import { APIService } from '../../api-service';
import { TuiButton, TuiLabel, TuiLoader, tuiLoaderOptionsProvider, TuiTextfield } from '@taiga-ui/core';
import {
  FormGroup,
  FormControl,
  NonNullableFormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import _ from 'lodash';
import { AuthService } from '../auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-auth',
  imports: [TuiButton, TuiLoader, TuiTextfield, TuiLabel, ReactiveFormsModule],
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
  readonly step = signal<'email' | 'password'>('email');
  readonly exists = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly errorMsg = signal<string | null>(null);

  readonly emailForm: FormGroup<{ email: FormControl<string> }>;

  readonly passwordForm: FormGroup<{ password: FormControl<string> }>;

  // Optional: react to error messages (could show Taiga alerts/dialogs later)
  readonly status = computed(() => ({
    loading: this.loading(),
    error: this.errorMsg(),
  }));

  constructor(
    private fb: NonNullableFormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.emailForm = this.fb.group({
      email: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(254),
        ],
      }),
    });

    this.passwordForm = this.fb.group({
      password: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(6)],
      }),
    });

    effect(() => {
      if (this.step() === 'email') {
        this.passwordForm.reset();
        this.errorMsg.set(null);
      }
    });
  }

  onEmailSubmit(): void {
    if (this.emailForm.invalid || this.loading()) return;
    const email = this.emailForm.controls.email.value.trim();
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

  backToEmail(): void {
    this.step.set('email');
  }

  onForgot(): void {
    this.errorMsg.set('Password reset flow not yet implemented.');
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid || this.loading()) return;

    const email = _.trim(this.emailForm.controls.email.value);
    const password = this.passwordForm.controls.password.value;

    this.loading.set(true);
    const op = this.exists() ? this.authService.login : this.authService.register;
    op(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: { message: any }) => {
        this.loading.set(false);
        this.errorMsg.set(err?.message ?? 'Authentication failed');
        // Surface the error under the field
        this.passwordForm.controls.password.setErrors({ server: true });
      },
    });
  }
}
