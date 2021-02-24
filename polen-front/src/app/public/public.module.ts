import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PublicRoutingModule } from './public-routing.module';
import { EventService } from '../shared/services/event/event.service';
import { HomeComponent } from './home/home.component';
import { RegisterFormComponent } from './register-form/register-form.component';

@NgModule({
  imports: [
    SharedModule,
    PublicRoutingModule
  ],
  declarations: [
    HomeComponent,
    RegisterFormComponent
  ],
  entryComponents: [
    RegisterFormComponent
  ],
  providers: [
    EventService
  ]
})
export class PublicModule { }
