import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
    return (invalidCtrl || invalidParent);
  }
}

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
  matcher: MyErrorStateMatcher;
  registrationForm: FormGroup;
  firstName: FormControl;
  lastName: FormControl;
  institution: FormControl;
  email: FormControl;
  passwords: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.matcher = new MyErrorStateMatcher();

    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      confirmPassword: ['', conditionalValidator(() => this.registrationForm.get('password').value !== this.registrationForm.get('confirmPassword').value, Validators.pattern(/\A(?!x)x/), 'Match error')]
    });
  }

  checkPasswords(group: FormGroup): object {
    const test = this.registrationForm.get('passwords.password');
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  submitForm(): void {
    // console.log(check);
  }

}
