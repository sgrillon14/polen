import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordComponent } from './change-password.component';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../shared/services/authentication/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../shared/services/authentication/session.service';
import { TranslatePipeStub } from '../../../testing/translate.pipe.stub';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let router: Router;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    translateService = jasmine.createSpyObj('TranslateService', ['get']);
    loginService = jasmine.createSpyObj('LoginService', ['changePassword', 'getUserDetails']);
    sessionService = jasmine.createSpyObj('SessionService', ['getUserInfo']);

    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule, RouterTestingModule ],
      declarations: [ ChangePasswordComponent, TranslatePipeStub],
      providers: [
        {provide: TranslateService, useValue: translateService},
        {provide: LoginService, useValue: loginService},
        {provide: SessionService, useValue: sessionService},
        {
          provide: ActivatedRoute, useValue: {
            data: of({isResetPassword: true})
          }
        },
        {
          provide: FormBuilder, useValue: formBuilder
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    router = TestBed.get(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.resetPassword).toBeTruthy();
  });

  it('should init form', () => {
    sessionService.getUserInfo.and.returnValue({username: 'username'});
    component.ngOnInit();
    expect(component.formChangePassword.value.username).toEqual('username');
  });

  it('should check confirm password invalid', () => {
    sessionService.getUserInfo.and.returnValue({username: 'username'});

    const control = formBuilder.group({
      newpassword: ['a'],
      confirmpassword: ['b']
    });
    expect(component.passwordConfirming(control).invalid).toBeTruthy();
  });

  it('should check confirm password valid', () => {
    sessionService.getUserInfo.and.returnValue({username: 'username'});

    const control = formBuilder.group({
      newpassword: ['a'],
      confirmpassword: ['a']
    });
    expect(component.passwordConfirming(control)).toBeUndefined();
  });

  it('should change password', () => {
    spyOn(router, 'navigate');
    loginService.changePassword.and.returnValue(of({}));
    loginService.getUserDetails.and.returnValue(of({}));
    component.formChangePassword.patchValue({
      username: 'username',
      oldpassword: 'oldpassword',
      passwords: {
        newpassword: 'newpassword'
      }
    });
    component.changePassword();
    expect(loginService.changePassword).toHaveBeenCalledWith('username', 'oldpassword', 'newpassword');
    expect(loginService.getUserDetails).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should change password but display error if user details cannot not be retrieved', () => {
    translateService.get.and.returnValue(of('ERROR'));
    loginService.changePassword.and.returnValue(of({}));
    loginService.getUserDetails.and.returnValue(throwError({}));
    component.formChangePassword.patchValue({
      username: 'username',
      oldpassword: 'oldpassword',
      passwords: {
        newpassword: 'newpassword'
      }
    });
    component.changePassword();
    expect(loginService.changePassword).toHaveBeenCalledWith('username', 'oldpassword', 'newpassword');
    expect(loginService.getUserDetails).toHaveBeenCalled();
    expect(component.errMsg).toEqual('ERROR');
  });

  it('should display error if an user not found occurs during change password', () => {
    translateService.get.and.returnValue(of('ERROR'));
    loginService.changePassword.and.returnValue(throwError({reason: 'USER_NOT_FOUND'}));
    component.formChangePassword.patchValue({
      username: 'username',
      oldpassword: 'oldpassword',
      passwords: {
        newpassword: 'newpassword'
      }
    });
    component.changePassword();
    expect(loginService.changePassword).toHaveBeenCalledWith('username', 'oldpassword', 'newpassword');
    expect(component.errMsg).toEqual('ERROR');
  });

  it('should display error if invalid password during change password', () => {
    translateService.get.and.returnValue(of('ERROR'));
    loginService.changePassword.and.returnValue(throwError({reason: 'PASSWORD_NOT_CONFORM_POLICY'}));
    component.formChangePassword.patchValue({
      username: 'username',
      oldpassword: 'oldpassword',
      passwords: {
        newpassword: 'newpassword'
      }
    });
    component.changePassword();
    expect(loginService.changePassword).toHaveBeenCalledWith('username', 'oldpassword', 'newpassword');
    expect(component.errMsg).toEqual('ERROR');
  });
});
