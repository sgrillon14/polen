import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin/admin.component';
import { AdminService } from './services/admin.service';
import { UserFormComponent } from './user-form/user-form.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent,
    UserFormComponent
  ],
  entryComponents: [
    UserFormComponent
  ],
  providers: [
    AdminService
  ]
})
export class AdminModule { }
