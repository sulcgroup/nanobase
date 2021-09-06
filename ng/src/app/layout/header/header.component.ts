import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { StructureService, User, UserService } from 'src/app/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  input = new FormControl();
  category = '';
  currentURL = '';
  user: User;
  categories = ['title', 'user_name', 'applications', 'modifications', 'keywords', 'authors'];
  options = {
    title: [],
    user_name: [],
    applications: [],
    modifications: [],
    keywords: [],
    authors: []
  };
  filteredOptions = {
    title: [],
    user_name: [],
    applications: [],
    modifications: [],
    keywords: [],
    authors: []
  };

  constructor(private router: Router, private userService: UserService, private structService: StructureService) { }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(
      userData => this.user = userData
    );
    this.currentURL = window.location.href;

    // this.router.events.subscribe(val => {
    //   if (val instanceof NavigationEnd) {
    //     this.input.setValue('');
    //   }
    // });

    this.structService.getAutofill(100).subscribe(
      data => this.options = data,
      err => console.log('err', err)
    );

    for (const category of this.categories) {
      this.filteredOptions[category] = this.input.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    }
  }

  search(): void {
    if (!this.category) {
      this.category = 'title';
    }
    this.router.navigateByUrl(`/?input=${this.input.value}&category=${this.category}`);
  }

  private _filter(value: string): string[] {
    const category = this.category ? this.category : 'title';
    const filterValue = value.toLowerCase();
    return this.options[category].filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

}
