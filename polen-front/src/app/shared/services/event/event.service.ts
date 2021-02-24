import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Event } from 'src/app/model/event.model';
import { Events } from 'src/app/model/events.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private BASE_API = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  get(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.BASE_API}/api/event/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.BASE_API}/api/event`, event);
  }

  deleteEvent(id: string): Observable<{}> {
    return this.http.delete(`${this.BASE_API}/api/event/` + id);
  }

  editEvent(event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.BASE_API}/api/event/` + event.id, event);
  }

  searchEvents(searchPage: number, pageSize: number): Observable<Events> {
    const params = new HttpParams()
      .set('page', String(searchPage))
      .set('size', String(pageSize));
    return this.http.get<Events>(`${this.BASE_API}/api/event`, {params});
  }

  getEvents(): Observable<Events> {
    return this.http.get<Events>(`${this.BASE_API}/api/public/events`);
  }

}
