import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  structures: Array<any> = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    const obs: Observable<any> = this.apiService.get('/recent_structures');
    obs.subscribe(data => this.structures = data);
  }

}
