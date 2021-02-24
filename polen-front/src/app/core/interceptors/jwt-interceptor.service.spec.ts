import { Type } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './jwt-interceptor.service';
import { TokenStorageService } from '../../shared/services/authentication/token-storage.service';


describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let tokenStorageService;
  let client: HttpClient;

  const tokenServiceSpy = jasmine.createSpyObj('TokenStorageService', ['getAccessToken']);
  const token = 'plop';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        },
        {provide: TokenStorageService, useValue: tokenServiceSpy},
      ],
    });
    client = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    tokenStorageService = TestBed.get(TokenStorageService);

    tokenStorageService.getAccessToken.and.returnValue(token);
  });

  it('should add an Authorization header', () => {
    client.get('/test').subscribe(
      data => {
      }
    );

    const httpRequest = httpMock.expectOne(`/test`);

    expect(httpRequest.request.headers.has('Authorization')).toEqual(true);

    expect(httpRequest.request.headers.get('Authorization')).toContain(`Bearer ${token}`);
  });
});
