import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenuComponent } from './components/menu/menu.component';
import { SessionService } from './services/authentication/session.service';
import { AwsService } from './services/aws/aws.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { LoginService } from './services/authentication/login.service';
import { RoleGuardService } from './guards/role-guard.service';
import { UserService } from './services/user/user.service';
import { ReferentialService } from './services/referentials/referential.service';
import { MapService } from './services/map/map.service';
import { HomeRedirectGuardService } from './guards/home-redirect-guard.service';
import { OneClickOnlyButtonDirective } from './directives/one-click-only-button/one-click-only-button.directive';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  declarations: [
  MenuComponent,
  OneClickOnlyButtonDirective],
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule,
    LeafletModule.forRoot()
  ],
  exports: [
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    MenuComponent
  ],
  providers: [
    SessionService,
    AwsService,
    AuthGuardService,
    RoleGuardService,
    HomeRedirectGuardService,
    UserService,
    ReferentialService,
    MapService,
    LoginService,
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
  ]
})
export class SharedModule {
}
