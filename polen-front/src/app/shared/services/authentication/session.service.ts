import { Injectable } from '@angular/core';
import { User } from 'src/app/model/user.model';
import { Observable } from 'rxjs';
import { AwsService } from '../aws/aws.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private currentUserKey = 'currentUser';
  private storage: Storage = localStorage;

  constructor(private awsService: AwsService) { }

  storeUserInfo(user: User) {
    this.storage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  removeUserInfo() {
    this.storage.clear();
  }

  getUserInfo(): User|null {
    try {
        const userInfoString = this.storage.getItem(this.currentUserKey);
        if (userInfoString) {
          return JSON.parse(userInfoString);
        } else {
          return null;
        }
    } catch (e) {
        return null;
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.awsService.isLoggedIn().pipe(
      map(awsLogged => awsLogged && this.storage.getItem(this.currentUserKey) !== null));
  }

}
