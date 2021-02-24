import { Component, OnInit } from '@angular/core';
import { LAST_ERROR_STORAGE_KEY } from '../../shared/constant/app.constants';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.scss']
})
export class ServerErrorComponent implements OnInit {

  private storage: Storage = localStorage;

  lastError: string;

  constructor() { }

  ngOnInit() {
    this.lastError = this.storage.getItem(LAST_ERROR_STORAGE_KEY);
  }

}
