import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
  { path: 'login' , component: LoginComponent },
  { path: 'logout' , component: LoginComponent },
  { path: 'changepassword', component: ChangePasswordComponent, data: { isChangePassword: true } },
  { path: 'resetpassword', component: ChangePasswordComponent, data: { isResetPassword: true } },
  { path: '**', redirectTo: '/error/404' }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class LoginRoutingModule { }
