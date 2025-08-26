import { TuiLoader, TuiRoot } from '@taiga-ui/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './shared/auth/auth-service';
import { Title } from '@angular/platform-browser';
import { TitleService } from './shared/title-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiLoader],
  providers: [HttpClient],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly authService = inject(AuthService);
  readonly titleService = inject(TitleService);
  navigationEnd = signal(false);
  isReady = computed(() => this.navigationEnd() && this.authService.initialized());

  constructor(private router: Router, private title: Title) {
    this.title.setTitle(this.titleService.fullTitle());
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.navigationEnd.set(false);
      } else if (event instanceof NavigationEnd) {
        this.navigationEnd.set(true);
      }
    });
  }
}
