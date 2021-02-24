import { Injectable } from '@angular/core';
import { Observable, forkJoin, EMPTY } from 'rxjs';
import { User } from '../../../model/user.model';
import { AwsUser } from './aws-user.model';
import * as AWS from 'aws-sdk/global';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import * as awsservice from 'aws-sdk/lib/service';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, ICognitoUserPoolData } from 'amazon-cognito-identity-js';
import { AppConfigService } from '../../../core/services/app-config.service';
import { ADMIN_ROLE } from '../../constant/app.constants';
import { TokenStorageService } from '../authentication/token-storage.service';
import { expand, map, mergeMap, toArray } from 'rxjs/operators';

const ADMIN_GROUP_NAME = 'Admin';

@Injectable({
  providedIn: 'root'
})
export class AwsService {

  public cognitoCreds: AWS.CognitoIdentityCredentials;

  constructor(
    private appConfigService: AppConfigService,
    private tokenStorageService: TokenStorageService
  ) {
  }

  getAwsConfig(): Observable<[ICognitoUserPoolData, string, string]> {
    return forkJoin(this.getPoolData(), this.getRegion(), this.getIdentityPoolId());
  }

  private getIdentityPoolId(): Observable<string> {
    return this.appConfigService.getConfig().pipe(map(config => {
      return config.identityPoolId;
    }));
  }

  private getRegion(): Observable<string> {
    return this.appConfigService.getConfig().pipe(map(config => {
      AWS.config.update({
        region: config.region,
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: ''
        })
      });
      return config.region;
    }));
  }

  private getPoolData(): Observable<ICognitoUserPoolData> {
    return this.appConfigService.getConfig().pipe(map(config => {
      const poolData: ICognitoUserPoolData = {
        UserPoolId: config.userPoolId,
        ClientId: config.clientId
      };
      return poolData;
    }));
  }

  setCognitoCreds(creds: AWS.CognitoIdentityCredentials) {
    this.cognitoCreds = creds;
  }

  getCognitoCreds() {
    return this.cognitoCreds;
  }

  buildCognitoCreds(idTokenJwt: string, poolData: ICognitoUserPoolData, region: string, identityPool: string) {
    const url = 'cognito-idp.' + region.toLowerCase() + '.amazonaws.com/' + poolData.UserPoolId;
    const logins: CognitoIdentity.LoginsMap = {};
    logins[url] = idTokenJwt;
    const params = {
      IdentityPoolId: identityPool,
      Logins: logins
    };
    const serviceConfigs = {} as awsservice.ServiceConfigurationOptions;
    const creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
    this.setCognitoCreds(creds);
  }

  getUsers(): Observable<User[]> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.getAllUsers(poolData, region, identityPool);
    }));
  }

  getAllUsersByPagination(firstPage: boolean,
                          data: any,
                          poolData: ICognitoUserPoolData,
                          region: string, identityPool: string): Observable<any> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);
    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      credentials: this.getCognitoCreds()
    });
    const params: CognitoIdentityServiceProvider.Types.ListUsersRequest = {
      UserPoolId: poolData.UserPoolId
    };
    if (data.PaginationToken) {
      params.PaginationToken = data.PaginationToken;
    } else if (!firstPage) {
      return EMPTY;
    }
    return new Observable(obs => {
      cognitoidentityserviceprovider.listUsers(params, (errr, dataFound) => {
        if (errr) {
          return obs.error(errr);
        } else {
          obs.next(dataFound);
          return obs.complete();
        }
      });
    });
  }

  private getAllUsers(poolData: ICognitoUserPoolData, region: string, identityPool: string): Observable<any> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);
    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      credentials: this.getCognitoCreds()
    });

    return this.getAllUsersByPagination(true, {}, poolData, region, identityPool).pipe(expand(data => {
        return this.getAllUsersByPagination(false, data, poolData, region, identityPool);
      }),
      mergeMap((data) => data.Users),
      toArray(),
      map(users => {
        return (users as any[]).map(user => {
          return {
            username: user.Username,
            email: user.Attributes.find(({Name}) => Name === 'email').Value,
            enabled: user.Enabled,
            status: user.UserStatus,
            roles: []
          };
        });
      }),
      mergeMap((users: User[]) => {
        const p = {
          GroupName: ADMIN_GROUP_NAME,
          UserPoolId: poolData.UserPoolId
        };
        return new Observable(ob => {
          cognitoidentityserviceprovider.listUsersInGroup(p, (err, d) => {
            if (err) {
              ob.error(err);
            } else {
              users.forEach(user => {
                if (d.Users.some(admin => admin.Username === user.username)) {
                  user.roles = [ADMIN_ROLE];
                }
                return user;
              });
              ob.next(users);
              return ob.complete();
            }
          });
        });
      }));
  }

  createUser(user: User): Observable<User[]> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.createNewUser(user, poolData, region, identityPool);
    }));
  }

  private createNewUser(user: User,
                        poolData: ICognitoUserPoolData,
                        region: string,
                        identityPool: string): Observable<User[]> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);
    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      credentials: this.getCognitoCreds()
    });
    const params = {
      UserPoolId: poolData.UserPoolId,
      Username: user.username,
      DesiredDeliveryMediums: ['EMAIL'],
      ForceAliasCreation: false,
      UserAttributes: [
        {
          Name: 'email',
          Value: user.email
        }, {
          Name: 'email_verified',
          Value: 'true'
        }
      ]
    };
    return new Observable(obs => {
      cognitoidentityserviceprovider.adminCreateUser(params, (error, data) =>
        this.voidActionAndReturnNext(error, obs, data ? data.User : data));
      }).pipe(mergeMap((u: AwsUser) => {
        const p = {
          GroupName: ADMIN_GROUP_NAME,
          UserPoolId: poolData.UserPoolId,
          Username: u.Username
        };
        return new Observable(ob => this.adminAddUserToGroup(p, ob, cognitoidentityserviceprovider, user, u));
      }),
      mergeMap((u: AwsUser) => {
        const p = {
          GroupName: ADMIN_GROUP_NAME,
          UserPoolId: poolData.UserPoolId,
          Username: u.Username
        };
        return new Observable<User[]>(ob => this.adminRemoveUserFromGroup(p, ob, cognitoidentityserviceprovider, user, u));
      }));
  }

  editUser(user: User): Observable<User> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.editAnyUser(user, poolData, region, identityPool);
    }));
  }

  resendTemporaryPassword(username: string): Observable<User[]> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.resendTemporaryPassword4newUser(username, poolData, region, identityPool);
    }));
  }

  private resendTemporaryPassword4newUser(username: string,
                                          poolData: ICognitoUserPoolData,
                                          region: string,
                                          identityPool: string): Observable<User[]> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);
    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      credentials: this.getCognitoCreds()
    });
    const params = {
      UserPoolId: poolData.UserPoolId,
      Username: username,
      DesiredDeliveryMediums: ['EMAIL'],
      ForceAliasCreation: false,
      MessageAction: 'RESEND'
    };
    return new Observable(obs => {
      cognitoidentityserviceprovider.adminCreateUser(params, (error, data) => this.voidActionAndReturnNext(error, obs, data.User));
    });
  }

  private editAnyUser(user: User,
                      poolData: ICognitoUserPoolData,
                      region: string,
                      identityPool: string): Observable<User> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);
    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      credentials: this.getCognitoCreds()
    });
    const params = {
      UserPoolId: poolData.UserPoolId,
      Username: user.username,
      UserAttributes: []
    };
    return new Observable(obs => {
      cognitoidentityserviceprovider.adminUpdateUserAttributes(params, (error, data) =>
        this.voidActionAndReturnNext(error, obs, user));
    }).pipe(mergeMap((u: User) => {
        const p = {
          GroupName: ADMIN_GROUP_NAME,
          UserPoolId: poolData.UserPoolId,
          Username: u.username
        };
        return new Observable(ob => this.adminAddUserToGroup(p, ob, cognitoidentityserviceprovider, user, u));
      }),
      mergeMap((u: User) => {
        const p = {
          GroupName: ADMIN_GROUP_NAME,
          UserPoolId: poolData.UserPoolId,
          Username: u.username
        };
        return new Observable<User>(ob => this.adminRemoveUserFromGroup(p, ob, cognitoidentityserviceprovider, user, u));
      }));
  }

  authenticate(user: string, password: string): Observable<void> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.authenticateUserPool(user, password, poolData, region, identityPool);
    }));
  }

  private authenticateUserPool(user: string,
                               password: string,
                               poolData: ICognitoUserPoolData,
                               region: string,
                               identityPool: string): Observable<void> {
    const authenticationData = {
      Username: user,
      Password: password
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userPool = new CognitoUserPool(poolData);
    const userData = {
      Username: user,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    const self = this;
    return new Observable(subscriber => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {
          const cognitoGetUser = userPool.getCurrentUser();
          if (cognitoGetUser != null) {
            cognitoGetUser.getSession( (err, session) => {
              if (session) {
                self.buildCognitoCreds(session.getIdToken().getJwtToken(), poolData, region, identityPool);

                // store jwt token in storage
                self.tokenStorageService.setAccessToken(session.getIdToken().getJwtToken());
                self.tokenStorageService.setRefreshToken(session.getRefreshToken().getToken());

                subscriber.next();
              }
            });
          } else {
            subscriber.error({
              reason: 'USER_NOT_FOUND'
            });
          }
        },
        onFailure: err => {
          console.log(err);
          if (err.code === 'PasswordResetRequiredException' || err.code === 'UserNotConfirmedException') {
            subscriber.error({
              reason: 'FORCE_CHANGE_PASSWORD',
              user: {
                username: user
              }
            });
          } else if (err.code === 'InvalidParameterException') {
            subscriber.error({
              reason: 'USER_NOT_CONFORM_POLICY'
            });
          } else {
            subscriber.error({
              reason: 'USER_NOT_FOUND'
            });
          }
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          subscriber.error({
            reason: 'FORCE_CHANGE_PASSWORD',
            user: {
              username: user
            }
          });
        }
      });
    });
  }

  isLoggedIn(): Observable<boolean> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
        return this.isLoggedInUserPool(poolData, region, identityPool);
      })
    );
  }

  private isLoggedInUserPool(poolData: ICognitoUserPoolData, region: string, identityPool: string): Observable<boolean> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);

    const userPool = new CognitoUserPool(poolData);
    const currentUser = userPool.getCurrentUser();


    return new Observable(
      observer => {
        if (currentUser) {
          currentUser.getSession((sessionError, session) => {
            if (sessionError) {
              observer.next(false);
              return observer.complete();
            } else {
              if (!session.isValid()) {
                this.refreshAccessToken().subscribe(() => {
                  observer.next(false);
                  return observer.complete();
                }, err => observer.error(err));
              }
              observer.next(session.isValid());
              return observer.complete();
            }
          });
        } else {
          observer.next(false);
          return observer.complete();
        }
      }
    );
  }

  refreshAccessToken(): Observable<string> {
    return this.getAwsConfig().pipe(
      mergeMap(([poolData, region, identityPool]) => {
        return this.refreshTokenUserPool(poolData, region, identityPool);
      })
    );
  }

  private refreshTokenUserPool(poolData: ICognitoUserPoolData, region: string, identityPool: string): Observable<string> {
    this.buildCognitoCreds(this.tokenStorageService.getAccessToken(), poolData, region, identityPool);

    const userPool = new CognitoUserPool(poolData);
    const currentUser = userPool.getCurrentUser();

    return new Observable(
      observer => {
        if (currentUser) {
          currentUser.getSession((sessionError, session) => {
            if (sessionError) {
              observer.error(sessionError);
            } else {
              currentUser.refreshSession(session.getRefreshToken(), (refreshError, refreshSession) => {
                if (refreshError) {
                  observer.error(refreshError);
                } else {
                  this.buildCognitoCreds(refreshSession.getIdToken().getJwtToken(), poolData, region, identityPool);
                  // store jwt token in storage
                  this.tokenStorageService.setAccessToken(refreshSession.getIdToken().getJwtToken());
                  this.tokenStorageService.setRefreshToken(refreshSession.getRefreshToken().getToken());
                  observer.next(refreshSession.getIdToken().getJwtToken());
                  return observer.complete();
                }
              });
            }
          });
        } else {
          observer.error({reason: 'no user'});
        }
      }
    );
  }

  changePassword(user: string, oldpassword: string, newpassword: string): Observable<void> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.changePasswordUserPool(user, oldpassword, newpassword, poolData);
    }));
  }

  private changePasswordUserPool(user: string,
                                 oldpassword: string,
                                 newpassword: string,
                                 poolData: ICognitoUserPoolData): Observable<void> {
    const authenticationData = {
      Username: user,
      Password: oldpassword
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userPool = new CognitoUserPool(poolData);
    const userData = {
      Username: user,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Observable(subscriber => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: r => {
          // nothing to do
        },
        onFailure: err => {
          console.log(err);
          if (err.code === 'PasswordResetRequiredException' || err.code === 'NotAuthorizedException') {
            cognitoUser.confirmPassword(oldpassword, newpassword, {
              onSuccess() {
                subscriber.next();
              },
              onFailure(e) {
                subscriber.error({
                  reason: 'USER_NOT_FOUND'
                });
              }
            });
          } else {
            subscriber.error({
              reason: 'USER_NOT_FOUND'
            });
          }
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          cognitoUser.completeNewPasswordChallenge(newpassword, {}, {
            onSuccess: res => {
              subscriber.next();
            },
            onFailure: err => {
              if (err.code === 'InvalidPasswordException') {
                subscriber.error({
                  reason: 'PASSWORD_NOT_CONFORM_POLICY',
                  user: {
                    username: user
                  }
                });
              } else {
                subscriber.error(err);
              }
            }
          });
        }
      });
    });
  }

  resetPassword(user: string): Observable<void> {
    return this.getAwsConfig().pipe(mergeMap(([poolData, region, identityPool]) => {
      return this.resetPasswordUserPool(user, poolData);
    }));
  }

  private resetPasswordUserPool(user: string, poolData: ICognitoUserPoolData): Observable<void> {
    const userPool = new CognitoUserPool(poolData);
    const userData = {
      Username: user,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);
    return new Observable(subscriber => {
      cognitoUser.forgotPassword({
        onSuccess: () => {
          subscriber.next();
        },
        onFailure: err => {
          if (err.name === 'InvalidParameterException' || err.name === 'UserNotFoundException') {
            subscriber.error({
              reason: 'USER_NOT_CONFORM_POLICY'
            });
          } else {
            subscriber.error(err);
          }
        }
      });
    });
  }

  private voidActionAndReturnNext(err, ob, u) {
    if (err) {
      console.log(err);
      ob.error(err);
    } else {
      ob.next(u);
      return ob.complete();
    }
  }

  private adminAddUserToGroup(p, ob, cognitoidentityserviceprovider, user, u) {
    if (user.roles.includes(ADMIN_ROLE)) {
      cognitoidentityserviceprovider.adminAddUserToGroup(p, (err, d) => this.voidActionAndReturnNext(err, ob, u));
    } else {
      ob.next(u);
      return ob.complete();
    }
  }

  private adminRemoveUserFromGroup(p, ob, cognitoidentityserviceprovider, user, u) {
    if (!user.roles.includes(ADMIN_ROLE)) {
      cognitoidentityserviceprovider.adminRemoveUserFromGroup(p, (err, d) => this.voidActionAndReturnNext(err, ob, u));
    } else {
      ob.next(u);
      return ob.complete();
    }
  }

}
