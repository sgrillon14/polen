import { Injectable } from '@angular/core';

const ACCESS_TOKEN_ID = 'access_token';
const REFRESH_TOKEN_ID = 'refresh_token';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private storage: Storage = localStorage;

  constructor() { }

  setAccessToken(value: string) {
    this.storage.setItem(ACCESS_TOKEN_ID, value);
  }

  setRefreshToken(value: string) {
    this.storage.setItem(REFRESH_TOKEN_ID, value);
  }

  getAccessToken(): string {
    return this.storage.getItem(ACCESS_TOKEN_ID);
  }

  getRefreshToken(): string {
    return this.storage.getItem(REFRESH_TOKEN_ID);
  }
}
