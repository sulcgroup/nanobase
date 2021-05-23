import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { StructureService, StructureCover, LoadbarService } from 'src/app/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  structures: Array<StructureCover> = [];
  oldHeight = 0;
  message: string;
  tags: {
    applications: Array<string>,
    modifications: Array<string>,
    keywords: Array<string>
  };
  months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec'];
  categories = {
    title: 'title',
    user_name: 'user',
    user_id: 'user_id',
    applications: 'application',
    modifications: 'modification',
    keywords: 'keyword',
    authors: 'author'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private structService: StructureService,
    public loadBarService: LoadbarService
  ) { }

  ngOnInit(): void {
    let input = this.route.snapshot.queryParams.input;
    let category = this.route.snapshot.queryParams.category;
    input ? this.loadSearch(input, category) : this.loadRecent(15);
    this.loadRecentTags(10);
    this.infiniteScroll();

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd && (val.url.startsWith('/?') || val.url === '/')) {
        const url = new URLSearchParams(val.url.slice(2));
        input = url.get('input');
        category = url.get('category');
        input ? this.loadSearch(input, category) : this.loadRecent(15);
      }
    });
  }

  ngOnDestroy(): void {
    document.addEventListener('scroll', e => e.stopImmediatePropagation(), true);
  }


  infiniteScroll(): void {
    const scrollListener = () => {
      const body = document.body;
      const html = document.documentElement;
      const currentHeight = window.scrollY + window.innerHeight;
      const totalHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight);
      if (currentHeight + 300 >= totalHeight && this.oldHeight + 300 < totalHeight) {
        this.oldHeight = currentHeight;
        this.loadRandom(5);
      }
    };
    document.addEventListener('scroll', scrollListener);
  }

  loadSearch(input: string, category: string): void {
    this.oldHeight = Infinity;
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
          if (this.categories[category] === 'user_id') {
            this.message = 'Showing your structures...';
          }
          else {
            this.message = `Showing structures with ${this.categories[category]} "${input}"...`;
          }
          console.log('Loaded searched structures: ', this.structures);
        }
        this.loadBarService.disable();
      },
      err => {
        console.log('err', err);
        this.loadBarService.disable();
      }
    );
  }

  loadRandom(count: number): void {
    this.structService.getRandom(count).subscribe(
      data => {
        data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
        this.structures.push(...data);
        console.log(`Loaded ${count} more structures: `, data);
        this.loadBarService.disable();
      },
      err => {
        console.log('err', err);
        this.loadBarService.disable();
      }
    );
  }

  loadRecent(count: number): void {
    this.oldHeight = 0;
    this.message = '';
    this.structService.getRecent(count).subscribe(
      data => {
        data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
        this.structures = data;
        console.log('Loaded recent structures: ', this.structures);
        this.loadBarService.disable();
      },
      err => {
        console.log('err', err);
        this.loadBarService.disable();
      }
    );
  }

  loadRecentTags(count: number): void {
    this.structService.getRecentTags(count).subscribe(
      data => this.tags = data,
      err => console.log('err', err)
    );
  }

  routeTag(input: string, category: string): void {
    this.router.navigateByUrl(`/?input=${input}&category=${category}`);
  }

  formatDate(date: Date): string {
    return this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`;
  }

}
