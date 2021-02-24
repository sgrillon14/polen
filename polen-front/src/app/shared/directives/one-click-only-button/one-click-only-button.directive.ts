import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Directive({
  selector: '[appOneClickOnlyButton]'
})
export class OneClickOnlyButtonDirective implements OnInit, OnDestroy {

  @Output() readonly oneClick = new EventEmitter<MouseEvent>();

  private readonly clicks = new Subject<MouseEvent>();
  private subscription: Subscription;
  private clicked = false;
  private button: ElementRef;


  constructor(el: ElementRef) {
    this.button = el;
  }

  ngOnInit() {
    this.listenToClicks();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.button.nativeElement.disabled = true;
    if (!this.clicked) {
      this.clicks.next(event);
    }
  }

  private listenToClicks() {
    this.subscription = this.clicks
      .subscribe(event => this.oneClick.emit(event));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
