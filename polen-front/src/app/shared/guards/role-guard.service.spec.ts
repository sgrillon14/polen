import { TestBed } from '@angular/core/testing';

import { RoleGuardService } from './role-guard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../services/user/user.service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

describe('RoleGuardService', () => {

  let userService: jasmine.SpyObj<UserService>;
  let service: RoleGuardService;
  let router: Router;

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', ['hasRole', 'hasAnyRole']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'test', redirectTo: 'test/1', canActivate: [ RoleGuardService ]}]
        )
      ],
      providers: [
        RoleGuardService,
        { provide: UserService, useValue: userService}
      ]
    });

    service = TestBed.get(RoleGuardService);

    router = TestBed.get(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should redirect to /error/not-authorized', () => {

    spyOn(router, 'navigate');

    userService.hasRole.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();
    route.data = { expectedRole: 'admin'};

    expect(service.canActivate(route)).toBeFalsy();

    expect(router.navigate).toHaveBeenCalledWith(['/error/not-authorized']);
  });

  it('should activate', () => {

    spyOn(router, 'navigate');

    userService.hasRole.and.returnValue(true);

    const route = new ActivatedRouteSnapshot();
    route.data = { expectedRole: 'admin'};

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).not.toHaveBeenCalledWith(['/error/not-authorized']);
  });

  it('should activate if one role', () => {

    spyOn(router, 'navigate');

    userService.hasAnyRole.and.returnValue(true);

    const route = new ActivatedRouteSnapshot();
    route.data = { expectedRoles: ['admin', 'PLFT']};

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).not.toHaveBeenCalledWith(['/error/not-authorized']);
  });

  it('should redirect to unauthorized if none role', () => {

    spyOn(router, 'navigate');

    userService.hasAnyRole.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();
    route.data = { expectedRoles: ['admin', 'PLFT']};

    expect(service.canActivate(route)).toBeFalsy();

    expect(router.navigate).toHaveBeenCalledWith(['/error/not-authorized']);
  });

  it('should redirect to unauthorized if no role expected', () => {

    spyOn(router, 'navigate');

    userService.hasAnyRole.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();
    route.data = { };

    expect(service.canActivate(route)).toBeFalsy();

    expect(router.navigate).toHaveBeenCalledWith(['/error/not-authorized']);
  });



});
