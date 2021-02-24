import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  async
} from '@angular/core/testing';

import { OneClickOnlyButtonDirective } from './one-click-only-button.directive';

@Component({
  template: `
    <div>
      <button appOneClickOnlyButton (oneClick)="add()"></button>
    </div>`
})
class TestComponent {
  count = 0;

  add() {
    this.count = this.count + 1;
  }
}

describe('NgxDebounceClickDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let button;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OneClickOnlyButtonDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    button = fixture.debugElement.nativeElement.querySelector('button');
    fixture.detectChanges();
  }));

  it(
    'should send only one click event',
    async () => {
      expect(component.count).toBe(0);
      button.click();
      button.click();
      button.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.count).toBe(1);
    });
});
