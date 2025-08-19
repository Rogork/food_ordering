import { CommonModule } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiAlertService,
  TuiButton,
  TuiDialog,
  TuiDialogService,
  TuiIcon,
  TuiLoader,
  TuiTextfield,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData, TuiSelect } from '@taiga-ui/kit';
import { AuthService } from '../../auth/auth-service';
import { Router } from '@angular/router';
import { filter, concatMap } from 'rxjs';

@Component({
  selector: 'app-titlebar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiDialog,
    TuiLoader,
    TuiTextfield,
    TuiSelect,
  ],
  templateUrl: './titlebar.html',
  styleUrl: './titlebar.less',
})
export class Titlebar {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  public readonly userProfile = this.authService.currentUser;

  currentPageTitle = signal('Dashboard');

  sidebarOpen = model(false);
  showProfileMenu = signal(false);

  ngOnInit() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', this.handleOutsideClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  toggleSidebar() {
    this.sidebarOpen.update((open) => !open);
  }

  toggleProfileMenu() {
    this.showProfileMenu.update((show) => !show);
  }

  private handleOutsideClick = (event: Event) => {
    if (!(event.target as Element).closest('.relative')) {
      this.showProfileMenu.set(false);
    }
  };

  handleProfileAction(action: string) {
    this.showProfileMenu.set(false);

    switch (action) {
      case 'logout':
        // Handle logout
        this.logout();
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      default:
        console.log(`Action: ${action}`);
    }
  }

  profileMenuItems = [
    { label: 'Profile Settings', icon: '👤', action: 'profile' },
    { label: 'Group Subscriptions', icon: '🍕', action: 'groups' },
    { label: 'Logout', icon: '🚪', action: 'logout' },
  ];

  logout() {
    const data: TuiConfirmData = {
      content: 'Are you sure you want to log out?',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, { label: 'Logout Confirm', size: 's', data })
      .pipe(
        filter((confirmed) => confirmed === true),
        concatMap(() => this.authService.logout())
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/auth']);
        },
        error: (err) => {
          this.alerts.open(
            'Error encountered while logging you out, please try again later',
            { label: 'Logout Error' }
          );
        },
      });
  }

  joinCodeForm = this.fb.group({ code: '' });
  isJoining = signal(false);
  joinCode = model<string>('');
  showJoinDialog = signal(false);
  joinGroup() {
    this.isJoining.set(true);
  }
}
