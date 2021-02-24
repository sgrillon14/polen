import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';

/**
 * Fix because refresh token is handled on http request but aws sdk is running outside ng-zone.
 * We need to force it.
 */
@Injectable()
export class NgZoneHttpInterceptorService implements HttpInterceptor {

  constructor(private ngZone: NgZone) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.ngZone.run(() => {
      return next.handle(req).pipe(enterZone(this.ngZone));
    });
  }
}

function enterZone<T>(zone: NgZone) {
  return (source: Observable<T>) => {
    return new Observable((sink: Observer<T>) => {
      return source.subscribe({
        next(x) {
          zone.run(() => sink.next(x));
        },
        error(e) {
          zone.run(() => sink.error(e));
        },
        complete() {
          zone.run(() => sink.complete());
        }
      });
    });
  };
}
