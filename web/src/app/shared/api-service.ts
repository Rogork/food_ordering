import { inject, Injectable } from '@angular/core';
import { catchError, Observable, Observer } from 'rxjs';
import _ from 'lodash';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

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

export type RequestParamOptions = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  withCredentials?: boolean;
  credentials?: RequestCredentials;
  keepalive?: boolean;
  priority?: RequestPriority;
  cache?: RequestCache;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  transferCache?: { includeHeaders?: string[]; } | boolean;
  observe?: 'body';
  responseType?: 'json';
}

const BASE_URL = 'http://localhost:4200/api';
@Injectable({ providedIn: 'root' })
export class APIService {

  readonly httpService: HttpClient = inject(HttpClient);

  public requestGET<T = void>(url: string, parameters: { [key: string]: number | string | boolean } = {}, options: RequestParamOptions = {}) {
    let fullUrl = `${BASE_URL}${url}`;
    if (!_.isEmpty(parameters)) {
      fullUrl += '?' + _.map(parameters, (v, k) => `${k}=${v}`).join('&');
    }
    options.observe = 'body';
    options.responseType = 'json';
    return this.httpService.get<APIResponse<T>>(fullUrl, options);
  }

  public requestPOST<T = void>(url: string, body: any | FormData = {}, options: RequestParamOptions = {}) {
    options.observe = 'body';
    options.responseType = 'json';
    return this.httpService.post<APIResponse<T>>(`${BASE_URL}${url}`, body, options);
  }

  public requestPUT<T = void>(url: string, body: any = {}, options: RequestParamOptions = {}) {
    options.observe = 'body';
    options.responseType = 'json';
    return this.httpService.put<APIResponse<T>>(`${BASE_URL}${url}`, body, options);
  }
}
