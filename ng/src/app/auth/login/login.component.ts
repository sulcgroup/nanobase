import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  email: FormControl;
  password: FormControl;
  error: string;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [Validators.required]);
    this.userService.currentUser.subscribe(data => console.log('cur', data));
    this.userService.isAuthenticated.subscribe(data => console.log('is', data));
  }

  getEmailError(): string {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordError(): string {
    return this.password.hasError('required') ? 'You must enter a value' : '';
  }

  submitForm(): void {
    this.email.disable();
    this.password.disable();
    this.error = '';

    const email = this.email.value;
    const password = this.password.value;

    this.userService.attemptLogin({email, password})
    .subscribe(
      data => {
        if (typeof(data) === 'string') {
          this.error = data;
          this.email.enable();
          this.password.enable();
        }
        else {
          this.router.navigateByUrl('/');
        }
      },
      err => {
        console.log(err);
        this.email.enable();
        this.password.enable();
      }
    );

  }

}
