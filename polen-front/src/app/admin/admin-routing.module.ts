import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin/admin.component';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuardService } from '../shared/guards/role-guard.service';
import { AuthGuardService } from '../shared/guards/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [ AuthGuardService, RoleGuardService ],
    data: {
      expectedRole: 'ADMIN'
    }
  },
  {
    path: '**',
    redirectTo: '/error/404'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminRoutingModule { }
