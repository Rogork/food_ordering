import { inject, Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import _ from 'lodash';
import { TuiAlertService } from '@taiga-ui/core';

export type APIResponse<T = void> = {
  code: number;
  msg?: string;
  data?: T;
} | {
  code: 200;
  msg?: string;
  data: T;
}

export type APIResponseObservable<T = void> = typeof Observable<APIResponse<T>>;

const BASE_URL = 'http://localhost:4200/api';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  public requestGET<T = void>(url: string, parameters: { [key: string]: number | string | boolean } = {}, options: RequestInit = {}) {
    return new Observable<APIResponse<T>>((observer) => {
      options.method = 'GET';
      let fullUrl = `${BASE_URL}${url}`;
      if (!_.isEmpty(parameters)) {
        fullUrl += '?' + _.map(parameters, (v, k) => `${k}=${v}`).join('&');
      }
      fetch(fullUrl)
        .then(this.handleResponse<T>(observer))
        .catch((err) => {
          observer.error(err);
          observer.complete();
        });
    });
  }

  public requestPOST<T = void>(url: string, body: any | FormData = {}, options: RequestInit = {}) {
    return new Observable((observer: Observer<APIResponse<T>>) => {
      options.method = 'POST';
      this.processBody(options, body);
      fetch(`${BASE_URL}${url}`, options)
        .then(this.handleResponse(observer))
        .catch((err) => {
          observer.error(err);
          observer.complete();
        });
    });
  }

  public requestPUT<T = void>(url: string, body: any = {}, options: RequestInit = {}) {
    return new Observable((observer: Observer<APIResponse<T>>) => {
      options.method = 'PUT';
      this.processBody(options, body);
      fetch(`${BASE_URL}${url}`, options)
        .then(this.handleResponse<T>(observer))
        .catch((err) => {
          observer.error(err);
          observer.complete();
        });
    });
  }

  processBody(options: RequestInit, body: any | FormData = {}) {
    if (body instanceof FormData) {
      options.headers = { 'Content-Type': 'multipart/form-data;' };
      options.body = body;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
  }

  handleResponse<T = void>(observer: Observer<APIResponse<T>>) {
    return (response: Response) => {
      if (!response.ok) {
        observer.error(response.statusText);
        observer.complete();
        return;
      }
      response
        .json()
        .then((data: T) => {
          observer.next(data as APIResponse<T>);
          observer.complete();
        })
        .catch((err) => {
          observer.error('Error parsing response JSON');
          observer.complete();
        });
    };
  }
}
