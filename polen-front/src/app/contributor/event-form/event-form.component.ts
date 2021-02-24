import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReferentialService } from 'src/app/shared/services/referentials/referential.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {

  @Input() formEvent: FormGroup;

  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {
    // this.referentialService.getProfiles().subscribe(profiles => this.profiles = profiles);
  }

  close() {
    this.activeModal.close(this.formEvent.value);
  }

}
