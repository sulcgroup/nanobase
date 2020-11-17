import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../core';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  hideOld = true;
  hideNew = true;
  oldPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);
  newPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);
  passwordResponse = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void { }

  logout(): void {
    this.userService.logout().subscribe(
      data => data.response === 'OK' ? this.router.navigateByUrl('/') : console.log(data),
      err => console.log(err)
    );
  }

  getOldPasswordError(): string {
    if (this.oldPassword.hasError('required')) {
      return 'You must enter a value';
    }
    return this.oldPassword.hasError('minlength') ? 'Must be at least 8 characters' : '';
  }

  getNewPasswordError(): string {
    if (this.newPassword.hasError('required')) {
      return 'You must enter a value';
    }
    return this.newPassword.hasError('minlength') ? 'Must be at least 8 characters' : '';
  }

  updatePassword(): void {
    this.oldPassword.disable();
    this.newPassword.disable();
    this.passwordResponse = '';

    this.userService.updatePassword(this.oldPassword.value, this.newPassword.value).subscribe(
      data => {
        const response = document.getElementById('password-response');
        if (data === 'Your password has been updated') {
          response.classList.remove('fail');
          response.classList.add('success');
        }
        else {
          response.classList.remove('success');
          response.classList.add('fail');
        }

        this.passwordResponse = data;
        this.oldPassword.enable();
        this.newPassword.enable();
      },
      err => {
        console.log(err);
        this.oldPassword.enable();
        this.newPassword.enable();
      }
    );
  }

}
