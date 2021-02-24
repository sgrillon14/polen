import { Injectable, NgZone } from '@angular/core';
import { SessionService } from '../services/authentication/session.service';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../services/authentication/login.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private loginService: LoginService,
    private sessionService: SessionService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const url: string = state.url;
    return this.sessionService.isLoggedIn().pipe(
      tap(loggedIn => {
        this.ngZone.run(() => {
          if (!loggedIn) {
            // Store the original url in login service and then redirect to login page
            this.loginService.landingPage = url;
            this.router.navigate(['/account/login']);
          }
        });
      })
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }

}
