import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { StructureService, User, UserService } from 'src/app/core';

@Component({
  selector: 'app-search-strctures',
  templateUrl: './search-strctures.component.html',
  styleUrl: './search-strctures.component.css',
})
export class SearchStrcturesComponent {
  input = new UntypedFormControl();
  category = '';
  currentURL = '';
  user: User;
  categories = [
    'title',
    'authors',
    'applications',
    'modifications',
    'keywords',
    'user_name',
  ];
  options = {
    title: [],
    user_name: [],
    applications: [],
    modifications: [],
    keywords: [],
    authors: [],
  };
  filteredOptions = {
    title: [],
    user_name: [],
    applications: [],
    modifications: [],
    keywords: [],
    authors: [],
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private structService: StructureService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser.subscribe((userData) => {
      this.user = userData;
      console.log(userData);
    });
    this.currentURL = window.location.href;

    // this.router.events.subscribe(val => {
    //   if (val instanceof NavigationEnd) {
    //     this.input.setValue('');
    //   }
    // });

    this.structService.getAutofill(100).subscribe(
      (data) => (this.options = data),
      (err) => console.log('err', err)
    );

    for (const category of this.categories) {
      this.filteredOptions[category] = this.input.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value))
      );
    }
  }

  search(): void {
    console.log('here');
    if (!this.category) {
      this.category = 'title';
    }
    this.router.navigateByUrl(
      `home?input=${this.input.value}&category=${this.category}`
    );
  }

  private _filter(value: string): string[] {
    const category = this.category ? this.category : 'title';
    const filterValue = value.toLowerCase();
    return this.options[category].filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }
}
