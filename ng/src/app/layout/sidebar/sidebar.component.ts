import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { User, UserService } from 'src/app/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean;
  user: User;
  initials: String = 'N/A';
  name: String = '';
  showFiller: boolean = true;
  @Input() sideNavOpen: boolean = true;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.isAuthenticated.subscribe(
      (auth) => (this.isAuthenticated = auth)
    );
    this.userService.currentUser.subscribe((userData) => {
      if (userData.firstName == undefined) return;
      console.log('Ankur', userData);
      this.user = userData;
      this.initials =
        this.user.firstName.charAt(0) + this.user.lastName.charAt(0);
      this.initials = this.initials.toUpperCase();
      this.name = this.user.firstName + ' ' + this.user.lastName;
    });
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}
