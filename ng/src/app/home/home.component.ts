import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { StructureService, StructureCover, LoadbarService } from 'src/app/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {
  structures: Array<StructureCover> = [];
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private structService: StructureService,
    public loadBarService: LoadbarService
  ) { }

  ngOnInit(): void {
    this.loadBarService.disable();
    let input = this.route.snapshot.queryParams.input;
    let category = this.route.snapshot.queryParams.category;
    input ? this.loadSearch(input, category) : this.loadRecent(15);
    this.loadRecentTags(100);
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
      if (currentHeight + 450 >= totalHeight && this.oldHeight + 450 < totalHeight) {
        this.oldHeight = currentHeight;
        this.loadNext();
        // this.loadRandom(5);
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
            this.message = `Showing structures with ${this.categories[category]} '${input}'...`;
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

  loadNext(): void {
    const date = this.structures[this.structures.length - 1].uploadDate;
    const dateStr = date.toISOString();
    this.structService.getNext(dateStr).subscribe(
      data => {
        data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
        this.structures.push(...data);
        console.log(`Loaded 5 more structures: `, data);
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

    this.structures = [
    {
      description: 'Hong et al\'s 20 degree layered crossover motif which was used to create 20 degree two-dimensional (2D) and three-dimensional (3D) crystalline structures that may host guest molecules or nanoparticles to achieve novel functionalities',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: 'Aatmik Mallya',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: 'asdfasdfa',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: 'Aatmik Mallya',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: 'Aatmik Mallya',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: 'asdfasdf',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: 'asdfas asdfasdfasdf asdf',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: 'dsfasdfas',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
    {
      description: '',
      displayImage: 'simResults/tetra (1).png',
      firstName: 'Aatmik',
      id: 23,
      lastAuthor: '',
      lastName: 'Mallya',
      title: 'test structure 4',
      uploadDate: new Date ('2021-04-29T00:00:00.000Z')
    },
  ]

    // this.structService.getRecent(count).subscribe(
    //   data => {
    //     data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
    //     this.structures = data;
    //     console.log('Loaded recent structures: ', this.structures);
    //     this.loadBarService.disable();
    //   },
    //   err => {
    //     console.log('err', err);
    //     this.loadBarService.disable();
    //   }
    // );
  }

  loadRecentTags(count: number): void {
    this.tagStore = {
      applications: [ 'uy','gkuy','ygkuy','yugkuygkuy','kuyu','kuyg','kuy','tfk','jyt','f','guyfiut','y','guy','gku','ygku','ku','gk','yg','ggk','asds','asdfwef','sdf','asdf','az','a','app30','app20','app10','application','gkuy','ygkuy','yugkuygkuy','kuyu','kuyg','kuy','tfk','jyt','f','guyfiut','y','guy','gku','ygku','ku','gk','yg','ggk','asds','asdfwef','sdf','asdf','az','a','app30','app20','app10'],
      keywords: [ 'asasdf', 'dfa', 'asdfa', 'key1', 'qqqqqq', 'key20', 'key30', 'c', 'ak', 'd', 'k', 'keywords', 'qwer'],
      modifications: [ 'd', 'sdf', 'asdsf', 'ada', 'qqqqq', 'mod20', 'mod30', 'b', 'an', 'm', 'asdf', 'sdf', 'asdsf', 'ada', 'qqqqq', 'mod20', 'mod30', 'b', 'an', 'm', 'asdf', 'sdf', 'asdsf', 'ada', 'qqqqq', 'mod20', 'mod30', 'b', 'an', 'm', 'asdf']
    };

    this.tags = {
          applications: this.tagStore.applications.slice(0, 10),
          modifications: this.tagStore.modifications.slice(0, 10),
          keywords: this.tagStore.keywords.slice(0, 10)
    };
    // this.structService.getRecentTags(count).subscribe(
    //   data => {
    //     this.tagStore = data;
    //     this.tags = {
    //       applications: this.tagStore.applications.slice(0, 10),
    //       modifications: this.tagStore.modifications.slice(0, 10),
    //       keywords: this.tagStore.keywords.slice(0, 10)
    //     };
    //   },
    //   err => console.log('err', err)
    // );
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
    console.log(this.appExpand);
    if (this.appExpand) {
      this.tags.applications = [...this.tagStore.applications];
    }
    else {
      this.tags.applications.splice(10, this.tags.applications.length - 5);
    }
  }
  toggleModificationExpand(): void {
    this.modExpand = !this.modExpand;
    console.log(this.modExpand);
    if (this.modExpand) {
      this.tags.modifications = [...this.tagStore.modifications];
    }
    else {
      this.tags.modifications.splice(10, this.tags.modifications.length - 5);
    }
  }
  toggleKeywordExpand(): void {
    this.keyExpand = !this.keyExpand;
    console.log(this.keyExpand);
    if (this.keyExpand) {
      this.tags.keywords = [...this.tagStore.keywords];
    }
    else {
      this.tags.keywords.splice(10, this.tags.keywords.length - 5);
    }
  }

}
