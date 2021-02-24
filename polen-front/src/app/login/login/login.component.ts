import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../shared/services/authentication/login.service';
import { AppConfigService } from 'src/app/core/services/app-config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {username: '', password: ''};
  errMsg = '';

  constructor(private router: Router,
              private translate: TranslateService,
              private loginService: LoginService,
              private appConfigService: AppConfigService) {
  }

  ngOnInit() {
    // this.loginService.logout();
    this.appConfigService.getConfig().subscribe();
  }

  login() {
    this.loginService.login(this.model.username, this.model.password)
      .subscribe(() => this.loginProcessor(), (error) => this.loginFailure(error));
  }

  resetPassword() {
    this.loginService.resetPassword(this.model.username).subscribe(() => {
      this.router.navigate(['/account/resetpassword']);
    }, err => this.loginFailure(err));
  }

  loginProcessor() {
    this.router.navigate(['/home']);
    this.closeAlert();
  }

  loginFailure(err: any) {
    this.closeAlert();
    if (err.reason === 'USER_NOT_FOUND' || err.status === 401 ) {
      this.translate.get('LOGIN.USER_NOT_FOUND').subscribe((text: string) => {
        this.errMsg = text;
      });
    } else if (err.reason === 'USER_NOT_CONFORM_POLICY') {
      this.translate.get('LOGIN.USER_NOT_CONFORM_POLICY').subscribe((text: string) => {
        this.errMsg = text;
      });
    } else if (err.reason === 'PASSWORD_NOT_CONFORM_POLICY' || err.reason === 'FORCE_CHANGE_PASSWORD') {
      this.router.navigate(['/account/changepassword']);
    } else if (err.reason === 'RESET_PASSWORD') {
      this.loginService.resetPassword(this.model.username).subscribe(() => {
      }, (error) => this.loginFailure(error));
    } else {
      this.router.navigate(['/error/server']);
    }
  }

  closeAlert() {
    this.errMsg = '';
  }

}
