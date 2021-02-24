import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AwsService } from '../aws/aws.service';
import { SessionService } from './session.service';
import { User } from 'src/app/model/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';

@Injectable()
export class LoginService {

  landingPage = '/';
  private BASE_API = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionService: SessionService,
    public awsService: AwsService
  ) {
  }


  login(username: string, password: string): Observable<User> {
    return this.awsService.authenticate(username, password)
      .pipe(
        switchMap(() => this.getUserDetails())
      );
  }

  getUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.BASE_API}/user/me`).pipe(tap(user => {
      // store user information in session storage to keep user logged in between page refreshes
      this.sessionService.storeUserInfo(user);
    }));
  }

  changePassword(username: string, oldpassword: string, newpassword: string): Observable<User> {
    return this.awsService.changePassword(username, oldpassword, newpassword).pipe(
      switchMap(() => this.login(username, newpassword)));
  }

  resetPassword(username: string): Observable<void> {
    return this.awsService.resetPassword(username);
  }

  logout(): void {
    // clear session remove user from local storage to log user out
    this.sessionService.removeUserInfo();
    this.router.navigate(['']);
  }
}
