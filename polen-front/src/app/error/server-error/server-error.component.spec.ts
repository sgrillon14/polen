import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerErrorComponent } from './server-error.component';
import { TranslatePipeStub } from '../../../testing/translate.pipe.stub';
import { LAST_ERROR_STORAGE_KEY } from '../../shared/constant/app.constants';

describe('ServerErrorComponent', () => {
  let component: ServerErrorComponent;
  let fixture: ComponentFixture<ServerErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerErrorComponent, TranslatePipeStub ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and set error', () => {
    localStorage.setItem(LAST_ERROR_STORAGE_KEY, 'error');
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(component.lastError).toEqual('error');
  });
});
