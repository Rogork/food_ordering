import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, GuardResult, RedirectCommand, Router } from "@angular/router";
import { AuthService } from "./auth-service";
import { map, Observable, of } from "rxjs";

export const isAuthenticated: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GuardResult>|GuardResult => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.init().pipe(
    map((result) => {
      if (authService.currentUser() === null) new RedirectCommand(router.parseUrl("/auth"), { skipLocationChange: true });
      return true;
    })
  )
};
