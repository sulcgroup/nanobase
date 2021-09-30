import { Component, OnInit } from '@angular/core';
import { UserService, LoadbarService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private userService: UserService, public loadBarService: LoadbarService) { }

  ngOnInit(): void {
    this.userService.populate();
  }

}
