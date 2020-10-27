import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  test = 'a';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    const obs = this.apiService.get('/test');
    obs.subscribe(data => this.test = data.res);
    console.log(this.test);
  }

}

// this.tagsService.getAll()
//     .subscribe(tags => {
//       this.tags = tags;
//       this.tagsLoaded = true;
//     });

// getAll(): Observable<[string]> {
//   return this.apiService.get('/tags')
//         .pipe(map(data => data.tags));
// }