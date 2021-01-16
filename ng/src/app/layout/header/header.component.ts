import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { User, UserService } from 'src/app/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  input = '';
  category = '';
  currentURL = '';
  user: User;

  constructor(private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(
      userData => this.user = userData
    );
    this.currentURL = window.location.href;

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.input = '';
        this.category = 'Search by';
      }
    });
  }

  search(): void {
    if (!this.category) {
      this.category = 'title';
    }
    this.router.navigateByUrl(`/?input=${this.input}&category=${this.category}`);
  }

}
