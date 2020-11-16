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
    .pipe(map(data => data.response));
  }

  attemptVerify(userId: string, verifyCode: string): Observable<any> {
    return this.apiService.put('/users/verify', { user_id: userId, verify_code: verifyCode })
    .pipe(map(data => data.response));
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  updateUser(user: User): Observable<User> {
    return this.apiService
    .put('/users', { user })
    .pipe(map(data => {
      this.currentUserSubject.next(data.response.user);
      return data.response.user;
    }));
  }

  attemptLogin(credentials: object): Observable<User> {
    return this.apiService.post('/users/login', {credentials})
    .pipe(map(data => {
      try {
        data = JSON.parse(data.response);
        this.setAuth(data);
        return data;
      }
      catch (e) {
        if (!(e instanceof SyntaxError)) {
          throw e;
        }
        return data.response;
      }
    }
    ));
  }

  logout(): Observable<any> {
    this.purgeAuth();
    return this.apiService.get('/logout');
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
    this.apiService.get('/users')
    .pipe(map(data => data.response))
    .subscribe(
      data => data === 404 ? this.purgeAuth() : this.setAuth(data),
      err => this.purgeAuth()
    );
  }

}
