import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventService } from 'src/app/shared/services/event/event.service';
import { Router } from '@angular/router';
import '../../../../node_modules/leaflet.browser.print/dist/leaflet.browser.print.min.js';
import '../../../../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.src.js';
import { Event } from 'src/app/model/event.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventFormComponent } from '../event-form/event-form.component';
import { Events } from 'src/app/model/events.model.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  page: number;
  pageSize = 10;
  events: Event[] = [];
  totalBakeries = 0;
  loading = false;
  searchForm: FormGroup;

  options: any = {};

  constructor(private router: Router,
              private eventService: EventService,
              private modalService: NgbModal,
              private ngZone: NgZone,
              private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.page = 1;
    this.totalBakeries = 0;
    this.search();
  }

  get f() {
    return this.searchForm.controls;
  }

  search() {
    const searchPage = this.page - 1;
    this.totalBakeries = 0;
    this.loading = true;
    this.eventService.searchEvents(searchPage, this.pageSize).subscribe(
      (page: Events) => {
        this.events = page.Items;
        this.totalBakeries = page.ScannedCount;
        this.loading = false;
      },
      () => this.router.navigate(['/error/server']),
      () => this.loading = false
    );
  }

  add() {
    const formEvent = this.formBuilder.group({
      date: '',
      organizer: '',
      numberOfPlaces: 5
    });
    const modalEvent = this.modalService.open(EventFormComponent);
    modalEvent.componentInstance.formEvent = formEvent;
    modalEvent.result.then((eventF) => {
      const event = new Event();
      event.date = eventF.date;
      event.organizer = eventF.organizer;
      event.students = new Array<string>(eventF.numberOfPlaces).fill('');
      this.createEvent(event);
    }, () => {
    });
  }

  createEvent(event: Event) {
    this.loading = true;
    this.eventService.createEvent(event).subscribe(() => this.search(),
      (error) => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.errorEventsProcessor(error));
      }
    );
  }

  delete(event: Event) {
    this.loading = true;
    this.eventService.deleteEvent(event.id).subscribe(() => this.search(),
      (error) => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.errorEventsProcessor(error));
      }
    );
  }

  errorEventsProcessor(error: any) {
    this.loading = false;
    console.log(error);
  }

}
