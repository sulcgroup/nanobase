import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormService, ApiService } from '../core';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadComponent implements OnInit {
  isOptional = true;
  isSubmitting = false;

  structureGroup: FormGroup;
  publicationGroup: FormGroup;
  fileGroup: FormGroup;
  miscGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Define each section and field of the form
    this.structureGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      applications: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
      modifications: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
      keywords: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
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
      structureFiles: this.fb.array([this.fb.group({
        file: ['', Validators.required],
        description: ['', Validators.required]
      })]),
      expProtocol: this.fb.array([this.fb.group({
        file: ['', Validators.required],
        description: ['', Validators.required]
      })]),
      expResults: this.fb.array([this.fb.group({
        file: ['', Validators.required],
        description: ['', Validators.required]
      })]),
      simProtocol: this.fb.array([this.fb.group({
        file: ['', Validators.required],
        description: ['', Validators.required]
      })]),
      simResults: this.fb.array([this.fb.group({
        file: ['', Validators.required],
        description: ['', Validators.required]
      })]),
      images: this.fb.array([this.fb.group({
        file: [''],
        description: ['']
      })]),
      displayImage: this.fb.control('')
    });

    this.miscGroup = this.fb.group({
      isPrivate: this.fb.control(true),
      isDelayed: this.fb.control(false),
      date: this.fb.control('')
    });

    // Update fields when author field changes
    this.fieldArray('authors', 2).valueChanges.subscribe(() => {
      this.publicationGroup.get('year').updateValueAndValidity();
      this.publicationGroup.get('citation').updateValueAndValidity();
      this.publicationGroup.get('link').updateValueAndValidity();
      this.publicationGroup.get('licensing').updateValueAndValidity();
    });
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
    let limit = 10;
    if (type === 'authors') {
      limit = 20;
    }
    if (this.fieldArray(type, group).value.length < limit) {
      let newField: FormGroup;
      if (group === 3) {
        newField = this.fb.group({
          file: ['', Validators.required],
          description: ['', Validators.required]
        });
      }
      else {
        newField = this.fb.group({ value: ['', Validators.required] });
      }
      this.fieldArray(type, group).push(newField);
    }
  }

  removeField(type: string, group: number, i: number): void {
    this.fieldArray(type, group).removeAt(i);
  }

  isImageFile(fileName?: string): boolean {
    if (fileName === undefined || fileName === null) {
      return;
    }
    const imgFormats = ['.jpg', '.png', '.tiff'];
    return imgFormats.some(suffix => fileName.endsWith(suffix));
  }

  submit(): void {
    this.isSubmitting = true;
    this.structureGroup.disable();
    this.publicationGroup.disable();
    this.fileGroup.disable();
    this.miscGroup.disable();

    const formValue = {
      ...this.structureGroup.value,
      ...this.publicationGroup.value,
      ...this.fileGroup.value,
      ...this.miscGroup.value,
    };

    this.apiService.post('/structure', {structure: formValue})
    .subscribe(
      data => {
        console.log('UPLOAD SUCCESS', data);
        this.isSubmitting = false;
        this.structureGroup.enable();
        this.publicationGroup.enable();
        this.fileGroup.enable();
        this.miscGroup.enable();
      },
      err => console.log('UPLOAD ERROR', err)
    );

  }

  test(): void {
    console.log(this.miscGroup.get('isDelayed'));
  }

}
