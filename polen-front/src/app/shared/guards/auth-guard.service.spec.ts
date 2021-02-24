import { TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthGuardService } from './auth-guard.service';
import { SessionService } from '../services/authentication/session.service';
import { LoginService } from '../services/authentication/login.service';
import { of } from 'rxjs';

describe('AuthGuardService', () => {

  let loginService = {
    landingPage: ''
  };
  let sessionService: jasmine.SpyObj<SessionService>;
  let service: AuthGuardService;
  let router: Router;

  beforeEach(() => {
    sessionService = jasmine.createSpyObj('SessionService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'test', redirectTo: 'test/1', canActivate: [AuthGuardService]}]
        )
      ],
      providers: [
        AuthGuardService,
        {provide: SessionService, useValue: sessionService},
        {provide: LoginService, useValue: loginService}
      ]
    });

    service = TestBed.get(AuthGuardService);

    loginService = TestBed.get(LoginService);

    router = TestBed.get(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should redirect to /account/login', () => {

    spyOn(router, 'navigate');

    sessionService.isLoggedIn.and.returnValue( of( false));

    const route = new ActivatedRouteSnapshot();
    const state = {root: undefined, url: 'test'};

    service.canActivate(route, state).subscribe( result => {
      expect(result).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['/account/login']);
      expect(loginService.landingPage).toEqual('test');
    });

  });

  it('should activate', () => {

    spyOn(router, 'navigate');

    sessionService.isLoggedIn.and.returnValue( of( true));

    const route = new ActivatedRouteSnapshot();
    const state = {root: undefined, url: 'test'};

    service.canActivate(route, state).subscribe( result => {
      expect(result).toBeTruthy();
      expect(router.navigate).not.toHaveBeenCalled();
    });

  });

  it('should activate for child', () => {

    spyOn(router, 'navigate');

    sessionService.isLoggedIn.and.returnValue( of( true));

    const route = new ActivatedRouteSnapshot();
    const state = {root: undefined, url: 'test'};

    service.canActivateChild(route, state).subscribe( result => {
      expect(result).toBeTruthy();
      expect(router.navigate).not.toHaveBeenCalled();
    });

  });


});
