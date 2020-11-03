import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { User, UserRegistration } from '../models/user.model';
import { map , distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) { }

  register(credentials: UserRegistration): Observable<User> {
    return this.apiService.post('/users', { user: credentials })
      .pipe(map(
      data => {
        // do stuff here
        console.log('DATA', data);
        return data;
      }
    ));
  }

}
