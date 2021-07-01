import { Component, OnInit } from '@angular/core';
import { LoadbarService } from '../core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(public loadBarService: LoadbarService) { }

  ngOnInit(): void {
    this.loadBarService.disable();
  }

}
