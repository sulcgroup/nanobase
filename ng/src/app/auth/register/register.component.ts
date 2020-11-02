import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { FormService } from '../../core/services/form.service';

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
    private router: Router,
    private userService: UserService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8), Validators.required]],
      confirmPassword: ['', [Validators.required,
        this.formService.conditionalValidator(() => !this.passwordMatch(), Validators.pattern(/\A(?!x)x/), 'match')]]
    });

    this.registrationForm.get('password').valueChanges.subscribe(() => {
      this.registrationForm.get('confirmPassword').updateValueAndValidity();
    });
  }

  passwordMatch(): boolean {
    return this.registrationForm.get('password').value === this.registrationForm.get('confirmPassword').value;
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
