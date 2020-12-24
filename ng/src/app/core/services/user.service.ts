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

  register(credentials: UserRegistration): Observable<any> {
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

  updatePassword(oldPass: string, newPass: string): Observable<any> {
    return this.apiService.put('/users/password', { old_pass: oldPass, new_pass: newPass})
    .pipe(map(data => data.response));
  }

  resetPassword(password: string, userId: number, token: string): Observable<any> {
    return this.apiService.get(`/users/forgot/${password}/${userId}/${token}`);
  }

  attemptLogin(credentials: object): Observable<any> {
    return this.apiService.post('/users/login', {credentials})
    .pipe(map(data => {
      data = data.response;
      try {
        this.setAuth(data);
        return data;
      }
      catch (e) {
        if (!(e instanceof SyntaxError)) {
          throw e;
        }
        return data;
      }
    }));
  }

  sendResetToken(email: string): Observable<any> {
    return this.apiService.post('/users/forgot', {email});
  }

  checkResetToken(token: string): Observable<any> {
    return this.apiService.get(`/users/forgot/${token}`);
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
      data => typeof(data) === 'object' ? this.setAuth(data) : this.purgeAuth(),
      err => this.purgeAuth()
    );
  }

}
