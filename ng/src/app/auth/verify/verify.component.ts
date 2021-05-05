import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../core';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  attemptedVerify = false;
  defaultMessage = false;
  verified = false;

  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    const userId: string = this.route.snapshot.queryParamMap.get('id');
    const verifyCode: string = this.route.snapshot.queryParamMap.get('verify');

    // Verify user
    if (userId && verifyCode) {
      this.userService.attemptVerify(userId, verifyCode).subscribe(
        data => {
          this.attemptedVerify = true;
          this.verified = data === 'OK';
        },
        err => console.log(err)
      );
    }
    else {
      this.defaultMessage = true;
    }
  }

}
