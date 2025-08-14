import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TuiAlertService, TuiIcon } from '@taiga-ui/core';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TUI_CONFIRM, type TuiConfirmData } from '@taiga-ui/kit';
import { AuthService } from '../../auth/auth-service';
import { concatMap, filter } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [TuiIcon, RouterModule],
  templateUrl: './nav.html',
  styleUrl: './nav.less',
})
export class Nav {
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  logout() {
    const data: TuiConfirmData = {
      content: 'Are you sure you want to log out?',
    };

    this.dialogs.open<boolean>(TUI_CONFIRM, { label: 'Logout Confirm', size: 's', data }).pipe(
      filter((confirmed) => confirmed === true),
      concatMap(() => this.authService.logout()),
    ).subscribe({
        next: () => {
          this.router.navigate(['/auth']);
        },
        error: (err) => {
          this.alerts.open("Error encountered while logging you out, please try again later", { label: "Logout Error" });
        }
      });
  }
}
