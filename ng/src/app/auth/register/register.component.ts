import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';


export function conditionalValidator(predicate: () => boolean, validator: ValidatorFn, errorNamespace?: string): ValidatorFn {
  return formControl => {
    if (!formControl.parent) {
      return null;
    }
    let error = null;
    if (predicate()) {
      error = validator(formControl);
    }
    if (errorNamespace && error) {
      const customError = {};
      customError[errorNamespace] = error;
      error = customError;
    }
    return error;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  hide = true;
  registrationForm: FormGroup;
  firstName: FormControl;
  lastName: FormControl;
  institution: FormControl;
  email: FormControl;
  passwords: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8), Validators.required]],
      confirmPassword: ['', [Validators.required,
        conditionalValidator(() => this.registrationForm.get('password').value !== this.registrationForm.get('confirmPassword').value,
        Validators.pattern(/\A(?!x)x/), 'match')]]
    });

    this.registrationForm.get('password').valueChanges.subscribe(() => {
      this.registrationForm.get('confirmPassword').updateValueAndValidity();
    });
  }

  submitForm(): void {
    this.registrationForm.disable();
    const userData = this.registrationForm.value;
    console.log(userData);

    this.userService
    .register(userData)
    .subscribe(
      data => this.router.navigateByUrl('/'),
      err => {
        console.log(err);
        this.registrationForm.enable();
      }
    );
  }

}
