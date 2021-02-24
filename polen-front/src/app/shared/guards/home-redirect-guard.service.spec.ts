import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../services/user/user.service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { HomeRedirectGuardService } from './home-redirect-guard.service';

describe('HomeRedirectGuardService', () => {

  let userService: jasmine.SpyObj<UserService>;
  let service: HomeRedirectGuardService;
  let router: Router;

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', ['isAdmin', 'isPlft', 'isSpada', 'isGu', 'isSupervisor']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'home', pathMatch: 'full', children: [], canActivate: [ HomeRedirectGuardService ]}]
        )
      ],
      providers: [
        HomeRedirectGuardService,
        { provide: UserService, useValue: userService}
      ]
    });

    service = TestBed.get(HomeRedirectGuardService);

    router = TestBed.get(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should redirect to /platform/home for plft user', () => {

    spyOn(router, 'navigate');

    userService.isPlft.and.returnValue(true);
    userService.isSpada.and.returnValue(false);
    userService.isAdmin.and.returnValue(false);
    userService.isGu.and.returnValue(false);
    userService.isSupervisor.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).toHaveBeenCalledWith(['/platform/home']);
  });

  it('should redirect to /spada/home for spada user', () => {

    spyOn(router, 'navigate');

    userService.isPlft.and.returnValue(false);
    userService.isSpada.and.returnValue(true);
    userService.isAdmin.and.returnValue(false);
    userService.isGu.and.returnValue(false);
    userService.isSupervisor.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).toHaveBeenCalledWith(['/spada/home']);
  });

  it('should redirect to /admin for admin user', () => {

    spyOn(router, 'navigate');

    userService.isPlft.and.returnValue(false);
    userService.isSpada.and.returnValue(false);
    userService.isAdmin.and.returnValue(true);
    userService.isGu.and.returnValue(false);
    userService.isSupervisor.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should redirect to /gu/home for gu user', () => {

    spyOn(router, 'navigate');

    userService.isPlft.and.returnValue(false);
    userService.isSpada.and.returnValue(false);
    userService.isAdmin.and.returnValue(false);
    userService.isGu.and.returnValue(true);
    userService.isSupervisor.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).toHaveBeenCalledWith(['/gu/home']);
  });

  it('should redirect to /supervisor for supervisor user', () => {

    spyOn(router, 'navigate');

    userService.isPlft.and.returnValue(false);
    userService.isSpada.and.returnValue(false);
    userService.isAdmin.and.returnValue(false);
    userService.isGu.and.returnValue(false);
    userService.isSupervisor.and.returnValue(true);

    const route = new ActivatedRouteSnapshot();

    expect(service.canActivate(route)).toBeTruthy();

    expect(router.navigate).toHaveBeenCalledWith(['/supervisor']);
  });

  it('should not activate for unknown profile', () => {

    spyOn(router, 'navigate');

    userService.isPlft.and.returnValue(false);
    userService.isSpada.and.returnValue(false);
    userService.isAdmin.and.returnValue(false);
    userService.isGu.and.returnValue(false);
    userService.isSupervisor.and.returnValue(false);

    const route = new ActivatedRouteSnapshot();

    expect(service.canActivate(route)).toBeFalsy();

    expect(router.navigate).not.toHaveBeenCalled();
  });

});
