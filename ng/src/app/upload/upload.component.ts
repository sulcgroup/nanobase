import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadComponent implements OnInit {
  isOptional = true;

  structureGroup: FormGroup;
  publicationGroup: FormGroup;
  fileGroup: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.structureGroup = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      size: ['', Validators.required],
      applications: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
      modifications: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
      keywords: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
      description: ['', Validators.compose([Validators.required, Validators.maxLength(300)])],
    });
    this.publicationGroup = this.fb.group({
      authors: this.fb.array([this.fb.group({ value: ['', Validators.required] })]),
      date: ['', Validators.required],
      citation: ['', Validators.required],
      licensing: ['', Validators.required]
    });
    this.fileGroup = this.fb.group({
      universal: ['', Validators.required],
      otherFormats: this.fb.array([this.fb.group({
        file: ['', Validators.required],
        description: ['', Validators.required]
      })]),
      image: ['', Validators.required],
      expProtocol: ['', Validators.required],
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
    let limit = 5;
    if (type === 'authors') {
      limit = 10;
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

  onSubmit(): void {
    console.log(this.structureGroup.value);
  }

  test(): void {
    console.log(this.fileGroup.valid, this.fileGroup.value);
  }

}
