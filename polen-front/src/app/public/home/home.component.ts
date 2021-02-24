import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/shared/services/event/event.service';
import { Event } from 'src/app/model/event.model';
import { Events } from 'src/app/model/events.model';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  events: Event[] = [];
  totalBakeries = 0;
  loading = false;

  constructor(private router: Router,
              private eventService: EventService,
              private modalService: NgbModal,
              private ngZone: NgZone,
              private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.totalBakeries = 0;
    this.search();
  }

  search() {
    this.totalBakeries = 0;
    this.loading = true;
    this.eventService.getEvents().subscribe(
      (page: Events) => {
        this.events = page.Items;
        this.totalBakeries = page.ScannedCount;
        this.loading = false;
      },
      () => this.router.navigate(['/error/server']),
      () => this.loading = false
    );
  }

  addCounter(students: string[]) {
    return students.filter((student) => {
      return student === '';
    });
  }

  filterStudents(students: string[]) {
    return students.filter((student) => {
      return student !== '' && student != null;
    });
  }

  add(event: Event) {
    const formUser = this.formBuilder.group({
      student: ''
    });
    const modalEvent = this.modalService.open(RegisterFormComponent);
    modalEvent.componentInstance.formUser = formUser;
    modalEvent.result.then((f) => {
      const students = event.students;
      students.splice(-1, 1);
      students.unshift(f.student);
      event.students = students;
      this.updateEvent(event);
    }, () => {
    });
  }

  updateEvent(event: Event) {
    this.loading = true;
    this.eventService.editEvent(event).subscribe(() => this.search(),
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
