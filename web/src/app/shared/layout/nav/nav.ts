import { Component, inject, model } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TuiAlertService, TuiIcon } from '@taiga-ui/core';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';
import { AuthService } from '../../auth/auth-service';
import { concatMap, filter } from 'rxjs';

interface NavigationItem {
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-nav',
  imports: [RouterModule],
  templateUrl: './nav.html',
  styleUrl: './nav.less',
})
export class Nav {
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly sidebarOpen = model(false);
  toggleSidebar() {
    this.sidebarOpen.update((val) => !val);
  }

  navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      icon: '🏠',
      path: '/',
    },
    {
      label: 'Orders',
      icon: '📋',
      path: '/orders',
      badge: 5,
      children: [
        { label: 'Active Orders', icon: '', path: '/orders/active' },
        { label: 'Order History', icon: '', path: '/orders/history' },
      ],
    },
    {
      label: 'Restaurants',
      icon: '🍽️',
      path: '/restaurants',
      children: [
        { label: 'Browse All', icon: '', path: '/restaurants/browse' },
        { label: 'Favorites', icon: '', path: '/restaurants/favorites' },
        { label: 'Recently Ordered', icon: '', path: '/restaurants/recent' },
      ],
    },
    {
      label: 'Groups',
      icon: '👥',
      path: '/groups',
      badge: 2,
    },
    {
      label: 'Settings',
      icon: '⚙️',
      path: '/settings',
    },
  ];
  val: any;
}
