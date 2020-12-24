import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {
  validated = false;
  checkCompleted = false;
  submitted = false;
  hidePassword = true;
  password = new FormControl('', [Validators.required, Validators.minLength(8)]);
  userId: number;
  header = 'You may create a new password below (must be at least 8 characters long).';


  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    const token: string = this.route.snapshot.queryParamMap.get('token');

    this.userService.checkResetToken(token)
    .subscribe(
      data => {
        if (typeof(data.response) === 'number') {
          this.validated = true;
          this.userId = data.response;
        }
        this.checkCompleted = true;

      },
      err => {
        console.log('err', err);
        this.checkCompleted = true;
      }
    );
  }

  getPasswordError(): string {
    if (this.password.hasError('required')) {
      return 'You must enter a value';
    }
    return this.password.hasError('minlength') ? 'Must be at least 8 characters' : '';
  }

  submit(): void {
    this.submitted = true;
    this.password.disable();
    const password = this.password.value;
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log(typeof(this.userId))

    this.userService.resetPassword(password, this.userId, token)
    .subscribe(
      data => {
        this.header = data.response;
        document.getElementById('header').classList.add('success');
      },
      err => {
        console.log('err', err);
      }
    );
  }

}
