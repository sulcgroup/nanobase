import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadbarService {
  public loadBar = true;

  constructor() { }

  enable(): void {
    this.loadBar = true;
  }

  disable(): void {    
    this.loadBar = false;
  }

  toggle(): void {
    this.loadBar = !this.loadBar;
  }
}
