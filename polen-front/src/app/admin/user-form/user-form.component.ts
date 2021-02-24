import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { ReferentialService } from '../../shared/services/referentials/referential.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {

  @Input() formUser: FormGroup;
  @Input() action: string;

  isEdit: boolean;
  profiles: string[];

  constructor(public activeModal: NgbActiveModal,
              private referentialService: ReferentialService) {

  }

  ngOnInit() {
    this.isEdit = this.action === 'EDIT';
    this.referentialService.getProfiles().subscribe(profiles => this.profiles = profiles);
  }

  close() {
    this.activeModal.close(this.formUser.value);
  }

}
