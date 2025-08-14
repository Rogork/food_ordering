import { inject, Injectable } from '@angular/core';
import { APIService } from '../shared/api-service';
import { map } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class SubsService {
  private readonly alerts = inject(TuiAlertService);

  constructor(private api: APIService) {}

  subscribe(code: string) {
    return this.api.requestPOST('/groups/sub', { code }).pipe(
      map(({ code, msg, data }) => {
        if (code !== 200) {
          this.alerts.open(`Error encountered: ${msg ?? 'UNSPECIFIED'}`, { label: 'Subscription Error' }).subscribe();
          return false;
        }
        return true;
      })
    );
  }
}
