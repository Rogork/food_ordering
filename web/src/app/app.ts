import { TuiLoader, TuiRoot } from '@taiga-ui/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiLoader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly authService = inject(AuthService);
  navigationEnd = signal(false);
  isReady = computed(() => this.navigationEnd() && this.authService.initialized());

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.navigationEnd.set(false);
      } else if (event instanceof NavigationEnd) {
        this.navigationEnd.set(true);
      }
    });
  }
}
