import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AwsService } from '../../shared/services/aws/aws.service';
import { SessionService } from '../../shared/services/authentication/session.service';
import { TokenStorageService } from '../../shared/services/authentication/token-storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private refreshTokenInProgress = false;

  // Refresh Token Subject tracks the current token, or is null if no token is currently
  // available (e.g. refresh pending).
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private awsService: AwsService,
    private tokenStorageService: TokenStorageService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 && !this.router.url.startsWith('/account/login')) {
            if (request.url.includes('amazonaws.com')) {
              this.router.navigate(['/account/login']);
            } else {
              return this.handleRefreshToken(request, next);
            }
          } else if (err.status === 403) {
            this.router.navigate(['/error/not-authorized']);
            return throwError(err);
          } else {
            return throwError(err);
          }
        }
      })
    );
  }

  private handleRefreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.refreshTokenInProgress) {
      // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
      // – which means the new token is ready and we can retry the request again
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap(() => next.handle(this.addAuthenticationToken(request))),
        catchError( (err) => {
          this.router.navigate(['/account/login']);
          this.refreshTokenInProgress = false;
          this.sessionService.removeUserInfo();
          return EMPTY;
        })
      );
    } else {
      this.refreshTokenInProgress = true;

      // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
      this.refreshTokenSubject.next(null);

      // Call auth.refreshAccessToken(this is an Observable that will be returned)
      return this.awsService.refreshAccessToken().pipe(
        switchMap((token: string) => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addAuthenticationToken(request));
        }),
        catchError((err: any) => {
          this.router.navigate(['/account/login']);
          this.refreshTokenInProgress = false;
          this.sessionService.removeUserInfo();
          return EMPTY;
        })
      );
    }
  }

  private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
    // Get access token from Local Storage
    const accessToken = this.tokenStorageService.getAccessToken();

    // If access token is null this means that user is not logged in
    // And we return the original request
    if (!accessToken) {
      return request;
    }

    // We clone the request, because the original request is immutable
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
}
