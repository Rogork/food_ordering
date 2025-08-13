import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiAlertService, TuiIcon } from '@taiga-ui/core';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import {TUI_CONFIRM, type TuiConfirmData} from '@taiga-ui/kit';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-nav',
  imports: [TuiIcon, RouterModule],
  templateUrl: './nav.html',
  styleUrl: './nav.less',
})
export class Nav {
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);

  logout() {
    const data: TuiConfirmData = { content: 'Are you sure you want to log out?' };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, { label: 'Logout Confirm', size: 's', data })
      .subscribe({
        next: (confirm) => {
          if (!confirm) return;

        }
      });
  }
}
