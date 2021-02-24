import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/authentication/session.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  user: User;
  isAdmin: boolean;
  isContributor: boolean;

  constructor(private sessionService: SessionService, private userService: UserService) { }

  ngOnInit() {
    this.user = this.sessionService.getUserInfo();
    this.isAdmin = this.userService.isAdmin();
    this.isContributor = this.userService.isContributor();
  }

}
