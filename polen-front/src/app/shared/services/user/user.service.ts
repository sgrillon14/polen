import { Injectable } from '@angular/core';
import { ADMIN_ROLE, CONTRIBUTOR_ROLE } from '../../constant/app.constants';
import { SessionService } from '../authentication/session.service';

@Injectable()
export class UserService {

  constructor(private sessionService: SessionService) { }

  hasRole(role: string): boolean {
    return this.sessionService.getUserInfo()
      && this.sessionService.getUserInfo().roles
      && this.sessionService.getUserInfo().roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasRole(ADMIN_ROLE);
  }

  isContributor(): boolean {
    return this.hasRole(CONTRIBUTOR_ROLE);
  }

}
