import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
// import { FileInput } from 'ngx-material-file-input';
import { map, publishBehavior, startWith } from 'rxjs/operators';
import { FormService, ApiService, StructureUpload, UserService, StructureService, User, LoadbarService } from '../core';

const required = ['', Validators.required];
const fileForm = {
  file: '',
  description: '',
  contents: [''],
};
const structureFileForm = {
  file: required,
  description: '',
  contents: [''],
};

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadComponent implements OnInit {  
  isOptional: boolean;
  today: Date;
  user: User;

  structureGroup: UntypedFormGroup;
  publicationGroup: UntypedFormGroup;
  fileGroup: UntypedFormGroup;
  miscGroup: UntypedFormGroup;

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
  scaffold1: UntypedFormControl;
  scaffold2: UntypedFormControl;
  scaffold3: UntypedFormControl;
  scaffold_names = ['M13mp18', 'p8064', 'p7308', 'p7560', 'Other']

  constructor(
    private fb: UntypedFormBuilder,
    public formService: FormService,
    private router: Router,
    private userService: UserService,
    private apiService: ApiService,
    private structService: StructureService,
    public loadBarService: LoadbarService
  ) {
    this.isOptional = false;
    this.today = new Date();
  }

  ngOnInit(): void {
    this.userService.currentUser.subscribe(user => this.user = user);

    // Define each section and field of the form
    this.structureGroup = this.fb.group({
      name: required,
      type: required,
      applications: this.fb.array([this.fb.group({ value: '', filteredOptions: [] })]),
      modifications: this.fb.array([this.fb.group({ value: '', filteredOptions: [] })]),
      keywords: this.fb.array([this.fb.group({ value: '', filteredOptions: [] })]),
      description: ['', Validators.compose([Validators.required, Validators.maxLength(1000)])],
      scaffold1: new UntypedFormControl(null),
      scaffold2: new UntypedFormControl(null),
      scaffold3: new UntypedFormControl(null),
      scaffoldOther: new UntypedFormControl(null)
    });

    this.publicationGroup = this.fb.group({
      authors: this.fb.array([this.fb.group({ value: [''] })]),
      doi: '',
      year: ['', Validators.compose([Validators.pattern(/^(19|20)\d{2}$/), this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value, Validators.required, 'Year error')])],
      month: ['', Validators.pattern(/(^0?[1-9]$)|(^1[0-2]$)/)],
      citation: ['', this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value, Validators.required, 'Citation error')],
      link: ['', this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value, Validators.maxLength(512), 'Link error')],
      licensing: ['', this.formService.conditionalValidator(() => this.fieldArray('authors', 2).value[0].value, Validators.maxLength(512), 'Licensing error')],
    });

    this.fileGroup = this.fb.group({
      isOxdna: this.fb.control(false),
      oxdna: this.fb.array([this.fb.group(fileForm)]),
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
      uploadDate: this.fb.control(required)
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

  // Search publication by DOI and autofill form
  autofillPublication(doi: string): void {
    this.loadBarService.enable();
    this.structService.getPublication(doi).subscribe(
      data => {
        const pub = data.response;
        // console.log(pub);
        // Set year
        for (let i = 0; i < pub.author.length; i++) {
          if (i > 0 && (this.publicationGroup.controls.authors as UntypedFormArray).controls.length < pub.author.length) {
            this.addField('authors', 2);
          }
          const name = pub.author[i].given + ' ' + pub.author[i].family;
          ((this.publicationGroup.controls.authors as UntypedFormArray).controls[i] as UntypedFormGroup).setValue({value: name});
        }

        // Set date
        this.publicationGroup.controls.year.setValue(pub.published['date-parts'][0][0]);
        let month = pub.published['date-parts'][0][1];
        month = month < 10 ? `0${month}` : month;
        this.publicationGroup.controls.month.setValue(month);

        // Set other fields
        this.publicationGroup.controls.link.setValue(pub.URL);

        this.loadBarService.disable();
      },
      err => {
        console.log('err', err);
        this.loadBarService.disable();
      }
    );
  }

  getAutofill(count: number): void {
    this.structService.getRecentTags(count).subscribe(
      data => {
        this.loadBarService.disable();
        this.options = data;
      },
      err => {
        this.loadBarService.disable();
        console.log('err', err);
      }
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
    this.loadBarService.enable();
    const structure: StructureUpload = this.processForm();
    console.log('Uploading structure...', structure);
    this.disableForm();

    this.apiService.post('/structure', { structure })
    .subscribe(
      data => {
        this.loadBarService.disable();
        console.log('UPLOAD SUCCESS', data);
        this.enableForm();
        this.router.navigateByUrl(`/structure/${data.response}`);
      },
      err => {
        this.loadBarService.disable();
        console.log('UPLOAD ERROR', err);
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

    // Format date
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
    let scaffold_names = ['m13 (p7249)', 'p8064', 'Other']
    if (structure.scaffold1) {
      structure.keywords.push({value: 'm13 (p7249)'});
    }
    if (structure.scaffold2) {
      structure.keywords.push({value: 'p8064'});
    }
    if (structure.scaffold3 && structure.scaffoldOther) {
      structure.keywords.push({value: structure.scaffoldOther});
    }
    delete structure.scaffold1;
    delete structure.scaffold2;
    delete structure.scaffold3;
    delete structure.scaffoldOther;

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

  fieldArray(type: string, group: number): UntypedFormArray {
    switch (group) {
      case 1: return this.structureGroup.get(type) as UntypedFormArray;
      case 2: return this.publicationGroup.get(type) as UntypedFormArray;
      case 3: return this.fileGroup.get(type) as UntypedFormArray;
      default: return;
    }
  }

  addField(type: string, group: number): void {
    const limit = 50;
    if (this.fieldArray(type, group).value.length < limit) {
      if (this.categories.includes(type)) {
        this.fieldArray(type, group).push(this.fb.group({ value: '' }));
        const i = this.filteredOptions[type].length;
        this.filteredOptions[type].push([]);
        this.filteredOptions[type][i] =
        this.structureGroup.get(type)['controls'][i]['controls'].value.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value, type))
        );
      }
      else {
        const newField = (group === 3) ? this.fb.group(structureFileForm) : this.fb.group({ value: required });
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

  checkImage(type: string, fileName: string): boolean {
    if (this.formService.isImageFile(fileName)) {
      if (!this.fileGroup['controls'].displayImage.value) {
        this.fileGroup['controls'].displayImage.setValue(type + '/' + fileName);
      }
      return true;
    }
    return false;
  }

}
