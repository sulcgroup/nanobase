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
  oldPassword = new FormControl('', [Validators.required]);
  newPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void { }

  logout(): void {
    this.userService.logout().subscribe(
      data => data.response === 'OK' ? this.router.navigateByUrl('/') : console.log(data),
      err => console.log(err)
    );
  }

  getOldPasswordError(): string {
    return this.oldPassword.hasError('required') ? 'You must enter a value' : '';
  }

  getNewPasswordError(): string {
    if (this.newPassword.hasError('required')) {
      return 'You must enter a value';
    }
    return this.newPassword.hasError('minlength') ? 'Must be at least 8 characters' : '';
  }

  // setPassword(): {

  // }

}
