import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from '../services/admin.service';
import { User } from '../../model/user.model';
import { UserFormComponent } from '../user-form/user-form.component';
import { ADMIN_ROLE } from '../../shared/constant/app.constants';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  notFoundDisplay: boolean;
  usernameExistsExceptionDisplay: boolean;
  integrityDisplay: boolean;
  unknownError: boolean;
  errDisplay: boolean;
  infoDisplay: boolean;
  users: User[] = [];
  loading = false;

  constructor(private adminService: AdminService,
              private modalService: NgbModal,
              private ngZone: NgZone,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.closeInfo();
    this.closeAlert();
    this.getUsers();
  }

  getUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe(users => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => { this.users = users; this.loading = false; });
      },
      (error) => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.errorUsersProcessor(error));
      }
    );
  }

  temporaryPasswordSend() {
    this.closeInfo();
    this.infoDisplay = true;
  }

  errorUsersProcessor(error: any) {
    this.loading = false;
    this.closeAlert();
    if (error.status === 404 || error.status === 504) {
      this.notFoundDisplay = true;
    } else if (error.code === 'UsernameExistsException') {
      this.usernameExistsExceptionDisplay = true;
    } else if (error.status === 400) {
      this.integrityDisplay = true;
    } else {
      this.unknownError = true;
    }
    this.errDisplay = true;
  }

  createUser(user: User) {
    this.loading = true;
    this.adminService.createUser(user).subscribe(() => this.getUsers(),
      (error) => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.errorUsersProcessor(error));
      }
    );
  }

  editUser(user: User) {
    this.loading = true;
    this.adminService.editUser(user).subscribe(() => this.getUsers(),
      (error) => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.errorUsersProcessor(error));
      }
    );
  }

  resendTemporaryPassword(username: string) {
    this.closeInfo();
    this.adminService.resendTemporaryPassword(username).subscribe(() => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.temporaryPasswordSend());
      }, (error) => {
        // Fix because angular is not aware of cognito callbacks
        this.ngZone.run(() => this.errorUsersProcessor(error));
      }
    );
  }

  closeAlert() {
    this.errDisplay = false;
    this.notFoundDisplay = false;
    this.usernameExistsExceptionDisplay = false;
    this.integrityDisplay = false;
  }

  closeInfo() {
    this.infoDisplay = false;
  }

  add() {
    this.closeAlert();
    this.closeInfo();
    const formUser = this.formBuilder.group({
      username: '',
      name: '',
      firstname: '',
      email: '',
      roles: [[ADMIN_ROLE]]
    });
    const modalUser = this.modalService.open(UserFormComponent);
    modalUser.componentInstance.formUser = formUser;
    modalUser.componentInstance.action = 'CREATE';
    modalUser.result.then((user: User) => {
      this.createUser(user);
    }, () => {
    });
  }

  edit(u: User) {
    this.closeAlert();
    const formUser = this.formBuilder.group({
      username: u.username,
      name: u.name,
      firstname: u.firstname,
      email: u.email,
      roles: [u.roles]
    });
    const modalUser = this.modalService.open(UserFormComponent);
    modalUser.componentInstance.formUser = formUser;
    modalUser.componentInstance.action = 'EDIT';
    modalUser.result.then((user: User) => {
      this.editUser(user);
    }, () => {
    });
  }


}
