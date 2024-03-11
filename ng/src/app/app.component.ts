import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { UserService, LoadbarService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
    public loadBarService: LoadbarService,
    private el: ElementRef
  ) {}

  sideNavOpen: boolean = false;
  ngOnInit(): void {
    this.userService.populate();

    this.el.nativeElement
      .querySelector('#main')
      .addEventListener('scroll', () => {
        console.log('scroling');
      });
  }

  toggleSideBar() {
    this.sideNavOpen = !this.sideNavOpen;
    console.log(this.sideNavOpen);
  }

  scrollToTop() {
    const targetDiv = this.el.nativeElement.querySelector('#main');
    if (targetDiv) {
      targetDiv.scrollTop = 0;
    }
  }
}
