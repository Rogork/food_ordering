import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, GuardResult, RedirectCommand, Router, ResolveFn } from "@angular/router";
import { AuthService } from "./auth-service";
import { map, Observable } from "rxjs";

export const isNotAuthenticated: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.init().pipe(
    map((result) => {
      if (authService.currentUser() !== null) return new RedirectCommand(router.parseUrl("/"));
      return true;
    })
  )
}

export const isAuthenticated: CanActivateFn = (route, state): Observable<GuardResult>|GuardResult => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.init().pipe(
    map((result) => {
      if (authService.currentUser() === null) return new RedirectCommand(router.parseUrl("/auth"), { skipLocationChange: true });
      return true;
    })
  )
};
