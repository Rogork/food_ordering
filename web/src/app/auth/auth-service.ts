import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { APIService } from './../api-service';
import { map, of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { isPlatformBrowser } from '@angular/common';

export interface IUserSession {
  _id: string;
  token: string;
  createdAt: Date;
  lastUsed: Date;
  ip?: string;
  device?: string;
  agent?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  session: IUserSession;
}

@Injectable({ providedIn: "root" })
export class AuthService {

  private readonly alerts = inject(TuiAlertService);
  private readonly platformId = inject(PLATFORM_ID);
  initialized = signal(false);
  currentUser = signal<IUser | null>(null);
  constructor(private api: APIService) {}

  init() {
    if (this.initialized() === true || !isPlatformBrowser(this.platformId)) return of(true);
    const token = localStorage.getItem('token');
    return this.api.requestGET<IUser>('/auth/email-exists', {}, { headers: { Authorization: `Bearer ${token}`}}).pipe(
      map(({ code, data }) => {
        if (code === 200) this.currentUser.set(data ?? null);
        this.initialized.set(true);
        return true;
      })
    )
  }

  emailExists(email: string) {
    return this.api.requestGET('/auth/email-exists', { email }).pipe(
      map((res) => {
        return res.code === 200;
      })
    )
  }

  get user() {
    return this.currentUser();
  }

  login(email: string, password: string) {
    return this.api.requestPOST<IUser>('/auth/login', { email, password }).pipe(
      map(({ code, msg, data }) => {
        if (code !== 200) {
          this.alerts.open(`Error encountered while logging in: ${msg ?? 'UNSPECIFIED'}`, { label: 'Login Error' }).subscribe();
          return false;
        }
        this.currentUser.set(data ?? null);
        return true;
      })
    );
  }

  register(email: string, password: string) {
    return this.api.requestPOST('/auth/register', { email, password }).pipe(
      map(({ code, msg, data }) => {
        if (code !== 200) {
          this.alerts.open(`Error encountered while registering: ${msg ?? 'UNSPECIFIED'}`, { label: 'Registration Error'}).subscribe();
          return false;
        }
        this.currentUser.set(data ?? null);
        return true;
      })
    );
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    return this.api.requestPOST<IUser>('/auth/logout').pipe(
      map(({ code, msg, data }) => {
        if (code !== 200) {
          this.alerts.open(`Error encountered while logging out: ${msg ?? 'UNSPECIFIED'}`, { label: 'Logout Error' }).subscribe();
          return false;
        }
        return true;
      })
    );
  }

}
