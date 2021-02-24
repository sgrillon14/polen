import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

@Injectable()
export class RoleGuardService implements CanActivate {

  constructor(private router: Router, private userService: UserService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    // this will be passed from the route config on the data property
    const expectedRole = route.data.expectedRole;
    const expectedRoles = route.data.expectedRoles;
    if (expectedRole) {
      if (this.userService.hasRole(expectedRole)) {
        return true;
      } else {
        this.router.navigate(['/error/not-authorized']);
        return false;
      }
    } else if (expectedRoles) {
      if (this.userService.hasAnyRole(expectedRoles)) {
        return true;
      } else {
        this.router.navigate(['/error/not-authorized']);
        return false;
      }
    } else {
      this.router.navigate(['/error/not-authorized']);
      return false;
    }
  }

}
