import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserService } from 'src/app/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  input = '';
  category = '';
  user: User;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(
      userData => this.user = userData
    );
  }

  search(): void {
    if (!this.category) {
      this.category = 'title';
    }
    this.router.navigateByUrl(`/?input=${this.input}&category=${this.category}`);
  }

}
