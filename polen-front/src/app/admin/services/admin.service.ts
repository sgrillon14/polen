import { Inject, Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../model/user.model';
import { AwsService } from '../../shared/services/aws/aws.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Injectable()
export class AdminService {

  private BASE_API = environment.apiUrl;

  constructor(private http: HttpClient,
              private awsService: AwsService) { }

  getUsers(): Observable<User[]> {
    const o1: Observable<User[]> = this.awsService.getUsers();
    const o2: Observable<User[]> =  this.http.get<User[]>(`${this.BASE_API}/api/admin/user`);

    return forkJoin(o1, o2).pipe(map(([users, backUsers]) => {
      let usersMerged = users.map(user => Object.assign(user, backUsers.find(backUser => backUser.username === user.username)));
      usersMerged = usersMerged.filter(user => backUsers.find(apiuser => apiuser.username === user.username));
      return usersMerged;
    }));
  }

  createUser(user: User): Observable<User> {
    const o1: Observable<User[]> = this.awsService.createUser(user);
    const o2: Observable<User> =  this.http.post<User>(`${this.BASE_API}/api/admin/user`, user);
    return forkJoin(o1, o2).pipe(map(([awsUserCreated, userCreated]) => userCreated));
  }

  editUser(user: User): Observable<User> {
    const o1: Observable<User> = this.awsService.editUser(user);
    const o2: Observable<User> =  this.http.put<User>(`${this.BASE_API}/api/admin/user/` + encodeURIComponent(user.username), user);
    return forkJoin(o1, o2).pipe(map(([awsUserUpdated, userUpdated]) => userUpdated));
  }

  resendTemporaryPassword(username: string) {
    return this.awsService.resendTemporaryPassword(username);
  }

}
