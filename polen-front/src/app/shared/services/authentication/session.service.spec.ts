import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';
import { AwsService } from '../aws/aws.service';
import { of } from 'rxjs';

describe('SessionService', () => {

  let awsService: jasmine.SpyObj<AwsService>;

  beforeEach(() => {
    awsService = jasmine.createSpyObj('AwsService', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [
        SessionService,
        {
          provide: AwsService, useValue: awsService
        }
      ]
    });
  });

  it('should be created', () => {
    const service: SessionService = TestBed.get(SessionService);
    expect(service).toBeTruthy();
  });

  it('should store user', () => {
    const service: SessionService = TestBed.get(SessionService);
    service.storeUserInfo({username: 'a'});
    expect(localStorage.getItem('currentUser')).toEqual('{"username":"a"}');
  });

  it('should clear user', () => {
    const service: SessionService = TestBed.get(SessionService);
    service.removeUserInfo();
    expect(localStorage.length).toBe(0);
  });

  it('should get user', () => {
    const service: SessionService = TestBed.get(SessionService);
    service.storeUserInfo({username: 'a'});
    expect(service.getUserInfo().username).toEqual('a');
  });

  it('should check is user is logged in', () => {
    const service: SessionService = TestBed.get(SessionService);
    awsService.isLoggedIn.and.returnValue(of(true));
    service.storeUserInfo({username: 'a'});
    service.isLoggedIn().subscribe(logged => {
      expect(logged).toBeTruthy();
    });
  });
});
