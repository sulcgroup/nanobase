import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, FormArray, Validators} from '@angular/forms';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isOptional = true;


  structureGroup = this.fb.group({
    firstCtrl: ['', Validators.required],
    thirdCtrl: ['', Validators.required]
  });
  publicationGroup = this.fb.group({
    secondCtrl: ''
  });
  fileGroup = this.fb.group({
    file: ''
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void { }

}
