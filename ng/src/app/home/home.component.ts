import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { StructureService, StructureCover, LoadbarService } from 'src/app/core';

const ev = e => e.stopImmediatePropagation();

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
  structures: Array<StructureCover> = [];
  wait = false;
  viewChecked = false;
  oldHeight = 0;
  message: string;
  tags: {
    applications: Array<string>,
    modifications: Array<string>,
    keywords: Array<string>
  };
  tagStore: {
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
  appExpand: boolean;
  modExpand: boolean;
  keyExpand: boolean;

  currentHeight = window.scrollY + window.innerHeight;
  totalHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                document.documentElement.clientHeight, document.documentElement.scrollHeight);
  iter = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private structService: StructureService,
    public loadBarService: LoadbarService,
    private changeDetection: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadBarService.disable();
    let input = this.route.snapshot.queryParams.input;
    let category = this.route.snapshot.queryParams.category;
    input ? this.loadSearch(input, category) : this.loadRecent(5);
    this.loadRecentTags(100);

    this.router.events.subscribe(event =>{
      if (event instanceof NavigationEnd){
        if (event.url == '/') {
          this.infiniteScroll();
        }
        else {
          document.removeEventListener('scroll', this.scrollListener);
        }
      }
   })

    if (!input) {
      this.infiniteScroll();
    }

    this.router.events.subscribe(val => {
      // this.infiniteScroll();
      if (val instanceof NavigationEnd && (val.url.startsWith('/?') || val.url === '/')) {
        const url = new URLSearchParams(val.url.slice(2));
        input = url.get('input');
        category = url.get('category');
        input ? this.loadSearch(input, category) : this.loadRecent(5);
      }
    });
  }

  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    document.addEventListener('scroll', ev, true);
    document.removeEventListener('scroll', this.scrollListener);
  }

  scrollListener = () => {
    const body = document.body;
    const html = document.documentElement;
    const currentHeight = window.scrollY + window.innerHeight;
    const totalHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight);
    
    if (currentHeight + 450 >= totalHeight && !this.wait) {
      this.wait = true;
      this.loadNext();
    }
  };

  infiniteScroll(): void {
    document.removeEventListener('scroll', ev, true);
    document.addEventListener('scroll', this.scrollListener);
  }

  loadSearch(input: string, category: string): void {
    this.oldHeight = Infinity;
    this.message = '';
    this.structService.search(input, category).subscribe(
      data => {
        if (Object.keys(data).length === 0) {
          this.message = `No structures match the query '${input}'.`;
          this.structures = [];
        }
        else {
          data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
          this.structures = data;
          if (this.categories[category] === 'user_id') {
            this.message = 'Showing your structures...';
          }
          else {
            this.message = `Showing search results for ${this.categories[category]} '${input}':`;
          }
          console.log('Loaded searched structures: ', this.structures);
        }
        this.loadBarService.disable();

        //this.keepLoading();
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
        this.changeDetection.detectChanges();
        console.log(`Loaded ${count} more structures: `, data);
        this.loadBarService.disable();
      },
      err => {
        console.log('err', err);
        this.loadBarService.disable();
      }
    );
  }

  loadNext(): void {
    const id = this.structures[this.structures.length - 1].id;
    this.structService.getNext(id).subscribe(
      (data) => {
        data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
        this.structures.push(...data);
        this.changeDetection.detectChanges();
        console.log(`Loaded 5 more structures2: `, data);
        
        this.loadBarService.disable();
        this.wait = false;
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

        this.currentHeight = window.scrollY + window.innerHeight;
        this.totalHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                      document.documentElement.clientHeight, document.documentElement.scrollHeight);
        this.iter = 0;

        this.keepLoading();
      },
      err => {
        console.log('err', err);
        this.loadBarService.disable();
      }
    );
  }

  keepLoading(): void {
    // const body = document.body;
    // const html = document.documentElement;
    // while (this.currentHeight === this.totalHeight && this.iter < 5) {
    //   this.loadNext();
    //   this.iter++;
    //   this.currentHeight = window.scrollY + window.innerHeight;
    //   this.totalHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight);
    // }

    if (this.currentHeight !== this.totalHeight || this.iter > 5) {
      return;
    }
    else {
      const id = this.structures[this.structures.length - 1].id;
      this.structService.getNext(id).subscribe(
        (data) => {
          data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
          this.structures.push(...data);
          this.changeDetection.detectChanges();
          console.log(`Loaded 5 more structures: `, data);

          this.iter++;
          this.currentHeight = window.scrollY + window.innerHeight;
          this.totalHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight,
                            document.documentElement.clientHeight, document.documentElement.scrollHeight);

          this.keepLoading();
        },
        err => {
          console.log('err', err);
        }
      );
    }


  }

  loadRecentTags(count: number): void {
    // this.tagStore = {
    //   applications: [ 'uy','gkuy','ygkuy','yugkuygkuy','kuyu','kuyg','kuy','tfk','jyt','f','guyfiut','y','guy','gku','ygku','ku','gk','yg','ggk','asds','asdfwef','sdf','asdf','az','a','app30','app20','app10','application','gkuy','ygkuy','yugkuygkuy','kuyu','kuyg','kuy','tfk','jyt','f','guyfiut','y','guy','gku','ygku','ku','gk','yg','ggk','asds','asdfwef','sdf','asdf','az','a','app30','app20','app10'],
    //   keywords: [ 'asasdf', 'dfa', 'asdfa', 'key1', 'qqqqqq', 'key20', 'key30', 'c', 'ak', 'd', 'k', 'keywords', 'qwer'],
    //   modifications: [ 'd', 'sdf', 'asdsf', 'ada', 'qqqqq', 'mod20', 'mod30', 'b', 'an', 'm', 'asdf', 'sdf', 'asdsf', 'ada', 'qqqqq', 'mod20', 'mod30', 'b', 'an', 'm', 'asdf', 'sdf', 'asdsf', 'ada', 'qqqqq', 'mod20', 'mod30', 'b', 'an', 'm', 'asdf']
    // };

    // this.tags = {
    //       applications: this.tagStore.applications.slice(0, 10),
    //       modifications: this.tagStore.modifications.slice(0, 10),
    //       keywords: this.tagStore.keywords.slice(0, 10)
    // };
    this.structService.getRecentTags(count).subscribe(
      data => {
        this.tagStore = data;
        this.tags = {
          applications: this.tagStore.applications.slice(0, 10),
          modifications: this.tagStore.modifications.slice(0, 10),
          keywords: this.tagStore.keywords.slice(0, 10)
        };
      },
      err => console.log('err', err)
    );
    this.appExpand = false;
    this.modExpand = false;
    this.keyExpand = false;
  }

  routeTag(input: string, category: string): void {
    this.router.navigateByUrl(`/?input=${input}&category=${category}`);
  }

  formatDate(date: Date): string {
    return this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`;
  }

  toggleApplicationExpand(): void {
    this.appExpand = !this.appExpand;
    if (this.appExpand) {
      this.tags.applications = [...this.tagStore.applications];
    }
    else {
      this.tags.applications.splice(10, this.tags.applications.length - 5);
    }
  }
  toggleModificationExpand(): void {
    this.modExpand = !this.modExpand;
    if (this.modExpand) {
      this.tags.modifications = [...this.tagStore.modifications];
    }
    else {
      this.tags.modifications.splice(10, this.tags.modifications.length - 5);
    }
  }
  toggleKeywordExpand(): void {
    this.keyExpand = !this.keyExpand;
    if (this.keyExpand) {
      this.tags.keywords = [...this.tagStore.keywords];
    }
    else {
      this.tags.keywords.splice(10, this.tags.keywords.length - 5);
    }
  }

  slideToggle(): void {
    if (this.viewChecked) {
      // this.infiniteScroll();
      setTimeout(() => {
        this.currentHeight = window.scrollY + window.innerHeight;
        this.totalHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                      document.documentElement.clientHeight, document.documentElement.scrollHeight);
        this.iter = 0;
        this.keepLoading();
      }, 50);
    }
  }

}
