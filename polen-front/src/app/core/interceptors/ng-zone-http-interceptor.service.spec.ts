import { TestBed } from '@angular/core/testing';

import { NgZoneHttpInterceptorService } from './ng-zone-http-interceptor.service';

describe('NgZoneHttpInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgZoneHttpInterceptorService = TestBed.get(NgZoneHttpInterceptorService);
    expect(service).toBeTruthy();
  });
});
