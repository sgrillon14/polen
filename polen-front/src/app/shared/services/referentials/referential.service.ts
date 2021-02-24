import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ReferentialService {

  constructor(private http: HttpClient) { }

  getProfiles(): Observable<string[]> {
    return this.http.get<any>('./assets/data/profiles.json').pipe(map((data) => data.profiles));
  }

}
