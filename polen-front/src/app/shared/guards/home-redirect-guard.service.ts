import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

@Injectable()
export class HomeRedirectGuardService implements CanActivate {

  constructor(private router: Router, private userService: UserService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.userService.isAdmin()) {
      this.router.navigate(['/admin']);
      return true;
    } else if (this.userService.isContributor()) {
      this.router.navigate(['/contributor/home']);
      return true;
    } else {
      return false;
    }
  }

}
