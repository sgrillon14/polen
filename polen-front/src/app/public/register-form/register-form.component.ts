import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {

  @Input() formUser: FormGroup;

  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {

  }

  close() {
    this.activeModal.close(this.formUser.value);
  }

}
