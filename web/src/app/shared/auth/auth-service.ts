import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { APIService } from '../../shared/api-service';
import { map, of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { isPlatformBrowser } from '@angular/common';

export enum EUserRole {
  User = 'U',
  Admin = 'A',
  Superuser = 'SU',
}

export interface IUserSession {
  token: string;
  createdAt: Date;
  lastUsed?: Date;
  ip?: string;
  device?: string;
  agent?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  avatar?: string;
  role?: EUserRole;
  groups?: Partial<IGroup>[];
}

export interface IGroup {
  _id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

@Injectable({ providedIn: "root" })
export class AuthService {

  private readonly alerts = inject(TuiAlertService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api = inject(APIService);

  constructor() { }

  initialized = signal(false);
  currentUser = signal<IUser | null>(null);

  init() {
    if (this.initialized() === true || !isPlatformBrowser(this.platformId)) return of(true);
    const token = localStorage.getItem('token');
    if (!token) {
      this.initialized.set(true);
      return of(true);
    }
    return this.api.requestGET<IUser>('/auth/get-details', {}, { headers: { Authorization: `Bearer ${token}` } }).pipe(
      map(({ code, data }) => {
        if (code === 200) this.currentUser.set(data ?? null);
        else localStorage.removeItem('token');
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
    return this.api.requestPOST<{ session: IUserSession, user: IUser }>('/auth/login', { email, password }).pipe(
      map(({ code, msg, data }) => {
        if (code !== 200) {
          this.alerts.open(`Error encountered while logging in: ${msg ?? 'UNSPECIFIED'}`, { label: 'Login Error' }).subscribe();
          return false;
        }
        localStorage.setItem('token', data!.session.token);
        this.currentUser.set(data!.user);
        return true;
      })
    );
  }

  register(email: string, password: string) {
    return this.api.requestPOST<{ user: IUser, session: IUserSession }>('/auth/register', { email, password }).pipe(
      map(({ code, msg, data }) => {
        if (code !== 200) {
          this.alerts.open(`Error encountered while registering: ${msg ?? 'UNSPECIFIED'}`, { label: 'Registration Error' }).subscribe();
          return false;
        }
        localStorage.setItem('token', data!.session.token);
        this.currentUser.set(data!.user ?? null);
        return true;
      })
    );
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    return this.api.requestPOST('/auth/logout').pipe(
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
