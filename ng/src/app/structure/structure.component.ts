import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Structure } from '../core/models/structure.model';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})
export class StructureComponent implements OnInit {
  sid: number;
  structure: Structure;

  constructor(private apiService: ApiService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sid = parseInt(params.get('sid'), 10);
      const obs: Observable<any> = this.apiService.get('/structure/' + params.get('sid'));
      obs.subscribe(data => this.structure = data);
    });

    // const obs: Observable<any> = this.apiService.get('/structure/' , this.routeSnap.params.sid);
    // obs.subscribe(data => console.log(data));
  }

}
