import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Nav } from './nav/nav';
import { Titlebar } from './titlebar/titlebar';
import { CommonModule } from '@angular/common';
import { TitleService } from '../title-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Nav, Titlebar, CommonModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.less'],
})
export class LayoutComponent implements OnInit {

  private readonly titleService = inject(TitleService);
  private readonly router = inject(Router);
  readonly currentPageTitle = this.titleService.fullTitle;
  readonly sidebarOpen = signal(false);

  breadcrumbs = signal([
    { label: 'Home', path: '/home' },
    { label: 'Dashboard', path: '/dashboard' },
  ]);

  backgroundParticles = Array.from({ length: 15 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
  }));

  ngOnInit() {
        // Listen to route changes to update page title and breadcrumbs
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updatePageInfo(event.urlAfterRedirects);
      });
  }

  private updatePageInfo(url: string) {
    // Update page title and breadcrumbs based on current route
    const segments = url.split('/').filter(Boolean);

    if (segments.length === 0 || segments[0] === 'home') {
      this.titleService.subtitle.set('Dashboard');
      this.breadcrumbs.set([{ label: 'Home', path: '/home' }]);
    } else {
      const title = this.formatTitle(segments[0]);
      this.titleService.subtitle.set(title);

      const breadcrumbs = [{ label: 'Home', path: '/home' }];
      let path = '';
      segments.forEach((segment) => {
        path += `/${segment}`;
        breadcrumbs.push({
          label: this.formatTitle(segment),
          path,
        });
      });
      this.breadcrumbs.set(breadcrumbs);
    }
  }


  private formatTitle(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
  }

}
