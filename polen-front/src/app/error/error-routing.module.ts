import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { ServerErrorComponent } from './server-error/server-error.component';

const routes: Routes = [
  { path: 'not-authorized', component: NotAuthorizedComponent},
  { path: 'server', component: ServerErrorComponent},
  { path: '**', component: PageNotFoundComponent}
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
export class ErrorRoutingModule {
}
