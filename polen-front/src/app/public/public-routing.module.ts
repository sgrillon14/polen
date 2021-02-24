import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../public/home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
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
export class PublicRoutingModule { }
