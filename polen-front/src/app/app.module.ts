import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { GlobalErrorHandler } from './core/global-error-handler/global-error-handler.service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MomentDateFormatter } from './core/utils/moment-date-formatter';

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    AppRoutingModule
  ],
  providers: [ { provide: LOCALE_ID, useValue: 'fr' },
               { provide: NgbDateParserFormatter, useValue: new MomentDateFormatter() },
               { provide: ErrorHandler, useClass: GlobalErrorHandler } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
