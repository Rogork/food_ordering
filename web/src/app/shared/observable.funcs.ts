import { Observable } from "rxjs";

export function ErrorObservable(err: string, log?: string|object) {
  return new Observable(observer => {
    console.log(log);
    observer.error(err);
    observer.complete();
  })
}
