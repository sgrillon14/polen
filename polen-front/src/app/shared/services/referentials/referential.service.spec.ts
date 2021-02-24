import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReferentialService } from './referential.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ReferentialService', () => {

  let httpMock: HttpTestingController;
  let service: ReferentialService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ReferentialService
      ]
    });

    httpMock = TestBed.get(HttpTestingController as Type<HttpTestingController>);
    service = TestBed.get(ReferentialService as Type<ReferentialService>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should retrieve profiles data', () => {

    service.getProfiles().subscribe(res => {
      expect(res.length).toBe(3);
      expect(res[0]).toEqual('ADMIN');
      expect(res[2]).toEqual('CONTRIBUTOR');
    });

    const req = httpMock.expectOne({ url: './assets/data/profiles.json', method: 'GET' });
    req.flush({
      profiles: ['ADMIN', 'CONTRIBUTOR']
    });
  });

});
