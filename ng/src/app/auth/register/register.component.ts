import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  hide = true;

  firstName = new FormControl('', [Validators.required]);
  lastName = new FormControl('', [Validators.required]);
  institution = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(8)]);

  constructor() { }

  ngOnInit(): void {
  }

  getFirstNameError(): string {
    return this.firstName.hasError('required') ? 'You must enter a value' : '';
  }

  getLastNameError(): string {
    return this.lastName.hasError('required') ? 'You must enter a value' : '';
  }

  getInstitutionError(): string {
    return this.institution.hasError('required') ? 'You must enter a value' : '';
  }

  getEmailError(): string {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordError(): string {
    if (this.password.hasError('required')) {
      return 'You must enter a value';
    }
    return this.password.hasError('minlength') ? 'Must be at least 8 characters' : '';
  }
}
