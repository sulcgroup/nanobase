import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FileInput } from 'ngx-material-file-input';
import { Structure, StructureService, User, FormService } from '../core';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})
export class StructureComponent implements OnInit {
  @ViewChild('slideToggle') editToggle: MatSlideToggle;
  id: number;
  structure: Structure;
  months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec'];
  files = {};
  isAuthor: boolean;
  isEditing = false;
  hasBeenEdited = false;
  confirmMessage = 'Your unsaved changes will be lost. Are you sure you want to switch to public view?';

  constructor(private structureService: StructureService,
              private formService: FormService,
              private route: ActivatedRoute,
              private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = parseInt(params.get('id'), 10);
      this.getStructure();
    });
  }

  toggleEditing(isEditing: boolean): void {
    // Reset "save changes" button
    if (isEditing && this.hasBeenEdited) {
      confirm(this.confirmMessage) ? location.reload() : this.editToggle.toggle();
    }
  }

  getStructure(): void {
    this.structureService.get(this.id).subscribe(
      data => {
        // console.log('data', data);
        data.response.uploadDate = new Date(data.response.uploadDate);
        data.response.publication.publishDate = data.response.publication.publishDate.split('-');

        // Read file contents
        const fileStrings = data.response.files_contents;
        const type = { type: 'text/plain' };
        const files = fileStrings.map(file => new File([new Blob([file.contents], type)], file.name, type));
        data.response.files_contents = files;
        this.structure = data.response;
        console.log('Loaded structure: ', this.structure);

        this.checkAuthor(this.structure.user.id);
      },
      err => console.log('err', err)
    );
  }

  checkAuthor(id: number): void {
    this.structureService.checkAuthor(id)
      .subscribe(
        data => this.isAuthor = data.response,
        err => console.log('err', err)
      );
  }

  deleteFile(type: string, i: number): void {
    this.hasBeenEdited = true;
    this.structure.files[type].splice(i, 1);
  }

  uploadFile(fileInput: FileInput, type: string): void {
    this.hasBeenEdited = true;
    const fileReader: FileReader = new FileReader();
    const file: File = fileInput.files[0];
    this.formService.isDataURLFile(file.name) ? fileReader.readAsDataURL(file) : fileReader.readAsText(file);

    fileReader.onloadend = () => {
      this.structure.files[type].push({
        description: '',
        name: file.name,
        contents: fileReader.result
      });
    };
  }

  save(): void {
    this.structureService.edit(this.structure).subscribe(
      data => console.log('Saved structure: ', data),
      err => console.log('err', err)
    );
    this.hasBeenEdited = false;
  }

  edited(): void {
    this.hasBeenEdited = true;
  }

  onLoadHandler(): void {
    const frame = document.getElementById('oxview-frame') as HTMLFrameElement;
    // tslint:disable-next-line: deprecation
    frame.contentWindow.postMessage({files: this.structure.files_contents}, 'http://localhost:8000');
  }

  routeTag(input: string, category: string): void {
    this.router.navigateByUrl(`/?input=${input}&category=${category}`);
  }

  formatDate(date: Date): string {
    return this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`;
  }

  formatPublishDate(date: Array<string>): string {
    if (date.length > 1) {
      return (date[1] === '00') ? date[0] : this.months[parseInt(date[1], 10)] + ' ' + date[0];
    }
    else {
      return this.formatDate(new Date(date[0]));
    }
  }

}

