import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileInput } from 'ngx-material-file-input';
import { map, startWith } from 'rxjs/operators';
import { FormService, ApiService, StructureUpload, UserService, StructureService, User } from '../core';

const required = ['', Validators.required];
const fileForm = {
  file: required,
  description: required,
  contents: [''],
};

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadComponent implements OnInit {
  isOptional = true;
  loadBar = false;
  today = new Date();
  user: User;

  structureGroup: FormGroup;
  publicationGroup: FormGroup;
  fileGroup: FormGroup;
  miscGroup: FormGroup;

  categories = ['applications', 'modifications', 'keywords'];
  options = {
    applications: [],
    modifications: [],
    keywords: [],
  };
  filteredOptions = {
    applications: [[]],
    modifications: [[]],
    keywords: [[]]
  };

  constructor(
    private fb: FormBuilder,
    public formService: FormService,
    private router: Router,
    private userService: UserService,
    private apiService: ApiService,
    private structService: StructureService
  ) { }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => this.user = user);

    // Define each section and field of the form
    this.structureGroup = this.fb.group({
      name: required,
      type: required,
      applications: this.fb.array([this.fb.group({ value: required, filteredOptions: [] })]),
      modifications: this.fb.array([this.fb.group({ value: required, filteredOptions: [] })]),
      keywords: this.fb.array([this.fb.group({ value: required, filteredOptions: [] })]),
      description: ['', Validators.compose([Validators.required, Validators.maxLength(300)])],
    });

    this.publicationGroup = this.fb.group({
      authors: this.fb.array([this.fb.group({ value: [''] })]),
      year: ['', Validators.compose([Validators.pattern(/^(19|20)\d{2}$/),
                 this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value,
                 Validators.required, 'Year error')])],
      month: ['', Validators.pattern(/(^0?[1-9]$)|(^1[0-2]$)/)],
      citation: ['', this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value,
                     Validators.required, 'Citation error')],
      link: ['', this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value,
                       Validators.required, 'Link error')],
      licensing: ['', this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value,
                       Validators.required, 'Licensing error')],
    });

    this.fileGroup = this.fb.group({
      structure: this.fb.array([this.fb.group(fileForm)]),
      expProtocol: this.fb.array([this.fb.group(fileForm)]),
      expResults: this.fb.array([this.fb.group(fileForm)]),
      simProtocol: this.fb.array([this.fb.group(fileForm)]),
      simResults: this.fb.array([this.fb.group(fileForm)]),
      images: this.fb.array([this.fb.group(fileForm)]),
      displayImage: this.fb.control('')
    });

    this.miscGroup = this.fb.group({
      isPrivate: this.fb.control(false),
      isDelayed: this.fb.control(false),
      uploadDate: this.fb.control('')
    });

    // Update fields when author field changes
    this.fieldArray('authors', 2).valueChanges.subscribe(() => {
      this.publicationGroup.get('year').updateValueAndValidity();
      this.publicationGroup.get('citation').updateValueAndValidity();
      this.publicationGroup.get('link').updateValueAndValidity();
      this.publicationGroup.get('licensing').updateValueAndValidity();
    });

    this.getAutofill(100);
  }

  getAutofill(count: number): void {
    this.structService.getRecentTags(count).subscribe(
      data => this.options = data,
      err => console.log('err', err)
    );
    // tslint:disable: no-string-literal
    for (const type of this.categories) {
      this.filteredOptions[type][0] =
      this.structureGroup.get(type)['controls'][0]['controls'].value.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value, type))
      );
    }
  }

  private _filter(value: any, category: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options[category].filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  submit(): void {
    const structure: StructureUpload = this.processForm();
    console.log('Uploading structure...', structure);
    this.loadBar = true;
    this.disableForm();

    this.apiService.post('/structure', { structure })
    .subscribe(
      data => {
        console.log('UPLOAD SUCCESS', data);
        this.loadBar = false;
        this.enableForm();
        this.router.navigateByUrl(`/structure/${data.response}`);
      },
      err => {
        console.log('UPLOAD ERROR', err);
        this.loadBar = false;
        this.enableForm();
      }
    );
  }

  processForm(): StructureUpload {
    const structure = {
      ...this.structureGroup.value,
      ...this.publicationGroup.value,
      ...this.fileGroup.value,
      ...this.miscGroup.value,
    };
    const month = structure.month;
    const year = structure.year;
    if (structure.isDelayed) {
      structure.uploadDate = structure.uploadDate.toISOString().slice(0, 10);
    }
    structure.publishDate = '';
    if (year) {
      structure.publishDate = year;
      if (month) {
        structure.publishDate += (month.length === 1) ? '-0' + month : '-' + month;
      }
      else {
        structure.publishDate += '-00';
      }
      structure.publishDate += '-02';
    }
    delete structure.year;
    delete structure.month;

    return structure;
  }

  uploadFile(fileInput: FileInput, type: string, index: number): void {
    const fileReader: FileReader = new FileReader();
    const file: File = fileInput.files[0];
    this.formService.isDataURLFile(file.name) ? fileReader.readAsDataURL(file) : fileReader.readAsText(file);

    fileReader.onloadend = () => {
      this.fileGroup.controls[type].value[index].contents = fileReader.result;
    };
  }

  fieldArray(type: string, group: number): FormArray {
    switch (group) {
      case 1: return this.structureGroup.get(type) as FormArray;
      case 2: return this.publicationGroup.get(type) as FormArray;
      case 3: return this.fileGroup.get(type) as FormArray;
      default: return;
    }
  }

  addField(type: string, group: number): void {
    const limit = (type === 'authors') ? 20 : 10;
    if (this.fieldArray(type, group).value.length < limit) {
      console.log(type, this.categories, type in this.categories);
      if (this.categories.includes(type)) {
        this.fieldArray(type, group).push(this.fb.group({ value: required }));
        const i = this.filteredOptions[type].length;
        this.filteredOptions[type].push([]);
        this.filteredOptions[type][i] =
        this.structureGroup.get(type)['controls'][i]['controls'].value.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value, type))
        );
      }
      else {
        const newField = (group === 3) ? this.fb.group(fileForm) : this.fb.group({ value: required });
        this.fieldArray(type, group).push(newField);
      }
    }
  }

  removeField(type: string, group: number, i: number): void {
    this.fieldArray(type, group).removeAt(i);
    if (this.categories.includes(type)) {
      this.filteredOptions[type].splice(i, 1);
    }
  }

  disableForm(): void {
    this.structureGroup.disable();
    this.publicationGroup.disable();
    this.fileGroup.disable();
    this.miscGroup.disable();
  }

  enableForm(): void {
    this.structureGroup.enable();
    this.publicationGroup.enable();
    this.fileGroup.enable();
    this.miscGroup.enable();
  }

}
