import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../../shared/services/authentication/session.service';
import { LoginService } from '../../shared/services/authentication/login.service';
import { AbstractControl, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  errMsg = '';
  formChangePassword: FormGroup;
  resetPassword = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sessionService: SessionService,
              private translate: TranslateService,
              private loginService: LoginService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.resetPassword = data.isResetPassword;
    });

    this.formChangePassword = this.formBuilder.group({
      username: [this.sessionService.getUserInfo() ? this.sessionService.getUserInfo().username : '', [Validators.required]],
      oldpassword: ['', [Validators.required]],
      passwords: this.formBuilder.group({
        newpassword: ['', [Validators.required]],
        confirmpassword: ['', [Validators.required]]
      }, {validator: this.passwordConfirming})
    });
  }

  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('newpassword').value !== c.get('confirmpassword').value) {
      return {invalid: true};
    }
  }

  changePassword() {
    this.loginService.changePassword(this.formChangePassword.value.username,
      this.formChangePassword.value.oldpassword,
      this.formChangePassword.value.passwords.newpassword)
      .subscribe(() => this.messageProcessor(), (error) => this.changePasswordError(error));
  }

  changePasswordError(err) {
    this.closeAlert();
    if (err.reason === 'USER_NOT_FOUND') {
      this.translate.get('LOGIN.USER_NOT_FOUND').subscribe((text: string) => {
        this.errMsg = text;
      });
    } else if (err.reason === 'PASSWORD_NOT_CONFORM_POLICY') {
      this.translate.get('LOGIN.PASSWORD_NOT_CONFORM_POLICY').subscribe((text: string) => {
        this.errMsg = text;
      });
    }
  }

  messageProcessor() {
    this.closeAlert();
    this.loginService.getUserDetails().subscribe(() => this.router.navigate(['/']),
      () =>
        this.translate.get('LOGIN.USER_NOT_FOUND').subscribe((text) => {
          this.errMsg = text;
        }));
  }

  closeAlert() {
    this.errMsg = '';
  }

}
