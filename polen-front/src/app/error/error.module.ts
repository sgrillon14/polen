import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { ErrorRoutingModule } from './error-routing.module';
import { ServerErrorComponent } from './server-error/server-error.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    NotAuthorizedComponent,
    ServerErrorComponent
  ],
  imports: [
    SharedModule,
    ErrorRoutingModule
  ]
})
export class ErrorModule { }
