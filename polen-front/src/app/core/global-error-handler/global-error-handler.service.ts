import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LAST_ERROR_STORAGE_KEY } from '../../shared/constant/app.constants';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  private storage: Storage = localStorage;

  constructor(private injector: Injector, private zone: NgZone) {}

  handleError(error: Error | HttpErrorResponse) {

    if (error) {
      this.zone.run(() => this.injector.get(Router).navigate(['/error/server']));
      if (error instanceof Error) {
        this.storage.setItem(LAST_ERROR_STORAGE_KEY, `${error.message} | ${error.stack} `);
      } else if (error instanceof HttpErrorResponse) {
        this.storage.setItem(LAST_ERROR_STORAGE_KEY, `${error.message} | ${error.error} `);
      }

    }
    // Log the error anyway
    console.error(error);
  }
}
