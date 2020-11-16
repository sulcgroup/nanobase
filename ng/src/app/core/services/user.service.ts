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
    return this.apiService.post('/users', { user: credentials });
  }

  attemptVerify(userId: string, verifyCode: string): Observable<any> {
    return this.apiService.put('/users/verify', { user_id: userId, verify_code: verifyCode });
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  updateUser(user: User): Observable<User> {
    return this.apiService
    .put('/user', { user })
    .pipe(map(data => {
      this.currentUserSubject.next(data.user);
      return data.user;
    }));
  }

  attemptLogin(credentials: object): Observable<User> {
    return this.apiService.post('/users/login', {credentials})
      .pipe(map(
      data => {
        try {
          data = JSON.parse(data);
          this.setAuth(data);
          return data;
        }
        catch (e) {
          if (!(e instanceof SyntaxError)) {
            throw e;
          }
          return data;
        }
      }
    ));
  }

  setAuth(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth(): void {
    this.currentUserSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);
  }

  // Runs once on application startup
  populate(): void {
    this.apiService.get('/users').subscribe(
      data => data === '404' ? this.purgeAuth() : this.setAuth(data),
      err => console.log('err', err)
    );
  }

}
