import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ContributorRoutingModule } from './contributor-routing.module';
import { SharedModule } from '../shared/shared.module';
import { EventFormComponent } from './event-form/event-form.component';
import { EventService } from '../shared/services/event/event.service';

@NgModule({
  declarations: [
    HomeComponent,
    EventFormComponent
  ],
  entryComponents: [
    EventFormComponent
  ],
  imports: [
    SharedModule,
    ContributorRoutingModule
  ],
  providers: [
    EventService
  ]
})
export class ContributorModule { }
