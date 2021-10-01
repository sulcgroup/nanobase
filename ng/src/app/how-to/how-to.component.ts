import { Component, OnInit } from '@angular/core';
import { LoadbarService } from '../core';

@Component({
  selector: 'app-how-to',
  templateUrl: './how-to.component.html',
  styleUrls: ['./how-to.component.css']
})
export class HowToComponent implements OnInit {

  constructor(public loadBarService: LoadbarService) { }

  ngOnInit(): void {
    this.loadBarService.disable();
  }

}
