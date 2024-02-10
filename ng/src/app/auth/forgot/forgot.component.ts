import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/core';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  header = 'Enter your email below, and we will email you a link to reset your password.';
  email: UntypedFormControl;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.email = new UntypedFormControl('', [Validators.required, Validators.email]);
  }

  getEmailError(): string {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }
    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  submit(): void {
    this.email.disable();

    const email = this.email.value;

    this.userService.sendResetToken(email).subscribe(
      data => {
        this.email.enable();
        this.header = data.response;
        document.getElementById('header').classList.add('success');
      },
      err => {
        console.log(err);
        this.email.enable();
      }
    );

  }

}
