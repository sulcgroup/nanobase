import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StructureService, StructureCover } from 'src/app/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  numStructures: 15;
  structures: Array<StructureCover> = [];
  message: string;
  months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec'];

  constructor(private router: Router, private route: ActivatedRoute, private structService: StructureService) { }

  ngOnInit(): void {
    let input = this.route.snapshot.queryParams.input;
    let category = this.route.snapshot.queryParams.category;
    input ? this.loadSearch(input, category) : this.loadRecent();

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const url = new URLSearchParams(val.url.slice(2));
        input = url.get('input');
        category = url.get('category');
        console.log(category)
        input ? this.loadSearch(input, category) : this.loadRecent();
      }
    });

  }

  loadSearch(input: string, category: string): void {
    this.message = '';
    this.structService.search(input, category).subscribe(
      data => {
        if (Object.keys(data).length === 0) {
          this.message = `No structures match the query "${input}".`;
          this.structures = [];
        }
        else {
          data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
          this.structures = data;
          console.log('Loaded recent structures: ', this.structures);
        }
      },
      err => console.log('err', err)
    );
  }

  loadRecent(): void {
    this.message = '';
    this.structService.getRecent(this.numStructures).subscribe(
      data => {
        data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
        this.structures = data;
        console.log('Loaded recent structures: ', this.structures);
      },
      err => console.log('err', err)
    );
  }

  formatDate(date: Date): string {
    return this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`;
  }

}
