import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalErrorHandler } from './global-error-handler.service';
import { LAST_ERROR_STORAGE_KEY } from '../../shared/constant/app.constants';

describe('GlobalErrorHandler', () => {
  let router: any;
  let service: GlobalErrorHandler;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: routerSpy},
        GlobalErrorHandler
      ],
    });

    router = TestBed.get(Router);
    service = TestBed.get(GlobalErrorHandler);

  });

  it('should redirect error to error page and store the error', () => {
    service.handleError(new Error('error'));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/server']);
    expect(localStorage.getItem(LAST_ERROR_STORAGE_KEY).indexOf('error')).toBe(0);
  });

  it('should redirect HttpErrorResponse to error page and store the error', () => {
    service.handleError(new HttpErrorResponse({ error: new Error('error'), status: 500 }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/server']);
    expect(localStorage.getItem(LAST_ERROR_STORAGE_KEY).indexOf('Error: error')).not.toBe(-1);
  });

});
