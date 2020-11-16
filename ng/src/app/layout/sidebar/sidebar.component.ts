import { Component, OnInit } from '@angular/core';
import { User, UserService } from 'src/app/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isAuthenticated: boolean;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.isAuthenticated.subscribe(
      auth => this.isAuthenticated = auth
    );
  }

}
