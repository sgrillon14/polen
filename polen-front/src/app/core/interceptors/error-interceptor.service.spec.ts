import { Type } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TokenStorageService } from '../../shared/services/authentication/token-storage.service';
import { ErrorInterceptor } from './error-interceptor.service';
import { AwsService } from '../../shared/services/aws/aws.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../services/app-config.service';
import { of } from 'rxjs';
import { SessionService } from '../../shared/services/authentication/session.service';
import { User } from '../../model/user.model';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let tokenStorageService: any;
  let router: any;
  let appConfigService: any;
  let awsService: any;
  let sessionService: any;
  let client: HttpClient;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const appConfigServiceSpy = jasmine.createSpyObj('AppConfigService', ['getConfig']);
  const awsServiceSpy = jasmine.createSpyObj('AwsService', ['refreshAccessToken']);
  const sessionServiceSpy = jasmine.createSpyObj('SessionService', ['getUserInfo']);
  const tokenServiceSpy = jasmine.createSpyObj('TokenStorageService', ['getAccessToken', 'getRefreshToken']);
  const token = 'plop';

  const user = {username: 'username'} as User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        },
        {provide: Router, useValue: routerSpy},
        {provide: AwsService, useValue: awsServiceSpy},
        {provide: AppConfigService, useValue: appConfigServiceSpy},
        {provide: TokenStorageService, useValue: tokenServiceSpy},
        {provide: SessionService, useValue: sessionServiceSpy},
      ],
    });

    client = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    appConfigService = TestBed.get(AppConfigService);
    tokenStorageService = TestBed.get(TokenStorageService);
    router = TestBed.get(Router);
    awsService = TestBed.get(AwsService);
    sessionService = TestBed.get(SessionService);

    tokenStorageService.getAccessToken.and.returnValue(token);
    tokenStorageService.getRefreshToken.and.returnValue(token);
    awsService.refreshAccessToken.and.returnValue(of('token'));
    sessionService.getUserInfo.and.returnValue(user);
  });

  it('should send a refresh token request if 401 error and not login attempt', () => {
    const emsg = 'deliberate 401 error';
    router.url = '/path/to/anything';

    client.get('/test').subscribe(
      data => { },
      (error: HttpErrorResponse) => {
        expect(awsServiceSpy.refreshAccessToken).toHaveBeenCalled();
      }
    );

    httpMock.expectOne(`/test`).flush(emsg, {status: 401, statusText: 'Unauthorized'});
  });

  it('should throw error if 401 error and login attempt', () => {
    const emsg = 'deliberate error';
    router.url = '/account/login';

    client.get('/test').subscribe(
      data => { },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
      }
    );

    httpMock
      .expectOne('/test')
      .flush(emsg, {status: 404, statusText: 'Not found'});
  });

  it('should route to error page if 403 error', () => {
    const emsg = 'deliberate 403 error';

    client.get('/test').subscribe(
      data => { },
      (error: HttpErrorResponse) => {
        expect(router.navigate).toHaveBeenCalledWith(['/error/not-authorized']);
      }
    );

    httpMock
      .expectOne(`/test`)
      .flush(emsg, {status: 403, statusText: 'Forbidden'});
  });

  it('should throw error if another type of error', () => {
    const emsg = 'deliberate error';

    client.get('/test').subscribe(
      data => { },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
      }
    );

    httpMock
      .expectOne(`/test`)
      .flush(emsg, {status: 404, statusText: 'Not found'});
  });
});
