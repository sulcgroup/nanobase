import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  AfterContentInit,
} from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
// import { FileInput } from 'ngx-material-file-input';
import {
  Structure,
  StructureService,
  User,
  FormService,
  LoadbarService,
} from '../core';
import { COMMA, ENTER, SEMICOLON } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css'],
})
export class StructureComponent implements AfterViewInit {
  @ViewChild('slideToggle') editToggle: MatSlideToggle;
  id: any;
  structure: Structure;
  months = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ];
  files = {};
  isAuthor: boolean;
  isEditing = false;
  hasBeenEdited = false;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON];
  confirmMessage =
    'Your unsaved changes will be lost. Are you sure you want to switch to public view?';
  deleteMessage =
    'Are you sure you want to delete the structure?  This action cannot be undone.';

  constructor(
    private structureService: StructureService,
    private formService: FormService,
    public loadBarService: LoadbarService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loadBarService.enable();
  }

  ngAfterViewInit(): void {
    this.loadBarService.enable();
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.getStructure();
    });
  }

  toggleEditing(isEditing: boolean): void {
    // Reset "save changes" button
    if (isEditing && this.hasBeenEdited) {
      confirm(this.confirmMessage)
        ? location.reload()
        : this.editToggle.toggle();
    }
  }

  getStructure(): void {
    this.structureService.get(this.id).subscribe(
      (data) => {
        data.response.uploadDate = new Date(data.response.uploadDate);
        const date = new Date(data.response.publication.publishDate);
        if (isNaN(date.getFullYear())) {
          data.response.publication.publishDate =
            data.response.publication.publishDate.split('-');
        } else {
          data.response.publication.publishDate = [];
          data.response.publication.publishDate[0] = date
            .getFullYear()
            .toString();
          data.response.publication.publishDate[1] = date.getMonth().toString();
          data.response.publication.publishDate[2] = '00';
        }

        // Read file contents
        const fileStrings = data.response.files_contents;
        const type = { type: 'text/plain' };
        const files = fileStrings.map(
          (file) => new File([new Blob([file.contents], type)], file.name, type)
        );
        data.response.files_contents = files;
        this.structure = data.response;
        this.structure.publication.link = this.addhttp(
          this.structure.publication.link
        );

        if (data.response.stats) {
          this.structure.statsData = data.response.stats.split('|');

          this.structure.statsData[0] = parseInt(
            this.structure.statsData[0],
            10
          );
          this.structure.statsData[1] = parseInt(
            this.structure.statsData[1],
            10
          );
          this.structure.statsData[2] = parseInt(
            this.structure.statsData[2],
            10
          );
          this.structure.statsData[3] = parseInt(
            this.structure.statsData[3],
            10
          );
        }

        console.log('Loaded structure: ', this.structure);

        this.checkAuthor(this.structure.user.id);
        this.loadBarService.disable();
      },
      (err) => console.log('err', err)
    );
  }

  checkAuthor(id: any): void {
    this.structureService.checkAuthor(id).subscribe(
      (data) => {
        if (data.response) {
          this.isAuthor = true;
        } else {
          this.structureService.checkAdmin().subscribe(
            (data2) => (this.isAuthor = data2.response),
            (err2) => console.log('err2', err2)
          );
        }
      },
      (err) => console.log('err', err)
    );
  }

  deleteFile(type: string, i: number): void {
    this.hasBeenEdited = true;
    this.structure.files[type].splice(i, 1);
  }

  uploadFile(fileInput: any, type: string): void {
    this.hasBeenEdited = true;
    const fileReader: FileReader = new FileReader();
    const file: File = fileInput.files[0];
    this.formService.isDataURLFile(file.name)
      ? fileReader.readAsDataURL(file)
      : fileReader.readAsText(file);

    fileReader.onloadend = () => {
      this.structure.files[type].push({
        description: '',
        name: file.name,
        contents: fileReader.result,
      });
    };
  }

  save(): void {
    this.loadBarService.enable();
    this.processDate();
    this.structureService.edit(this.structure).subscribe(
      (data) => {
        this.loadBarService.disable();
        console.log('Saved structure: ', data);
      },
      (err) => {
        this.loadBarService.disable();
        console.log('err', err);
      }
    );
    this.hasBeenEdited = false;
  }

  togglePrivate(): void {
    this.loadBarService.enable();
    console.log(this.structure);
    this.structureService.togglePrivate(this.structure).subscribe(
      (data) => {
        this.loadBarService.disable();
        console.log('Structure toggled: ', data);
        this.router.navigateByUrl(`/structure/${data.response}`);
      },
      (err) => {
        this.loadBarService.disable();
        console.log('err', err);
      }
    );
  }

  delete(): void {
    this.loadBarService.enable();
    if (confirm(this.deleteMessage)) {
      this.structureService.delete(this.structure.id).subscribe(
        (data) => {
          this.loadBarService.disable();
          console.log('Deleted structure: ', data);
          this.router.navigate(['/']);
        },
        (err) => {
          this.loadBarService.disable();
          console.log('err', err);
        }
      );
    }
  }

  checkOxdna(value: boolean, file: string): void {
    if (value) {
      if (this.structure.files.oxdnaFiles.indexOf(file) < 0) {
        this.structure.files.oxdnaFiles.push(file);
      }
    } else {
      this.structure.files.oxdnaFiles = this.structure.files.oxdnaFiles.filter(
        (oxdnaFile) => oxdnaFile !== file
      );
    }
    console.log(this.structure.files.oxdnaFiles);
  }

  processDate(): void {
    const year = this.structure.publication.publishDate[0];
    const month = this.structure.publication.publishDate[1];
    if (month.length === 1) {
      this.structure.publication.publishDate[1] = '0' + month;
    }
    if (!month) {
      this.structure.publication.publishDate[1] = '00';
    }
    if (!year) {
      this.structure.publication.publishDate[0] = '0000';
    }
  }

  edited(): void {
    this.hasBeenEdited = true;
  }

  onLoadHandler(): void {
    const frame = document.getElementById('oxview-frame') as HTMLFrameElement;
    // tslint:disable-next-line: deprecation
    frame.contentWindow.postMessage(
      { files: this.structure.files_contents, message: 'drop' },
      'https://sulcgroup.github.io/oxdna-viewer/'
    );
  }

  routeTag(input: string, category: string): void {
    this.router.navigateByUrl(`/?input=${input}&category=${category}`);
  }

  removeTag(index: number, type: string): void {
    this.hasBeenEdited = true;
    if (type === 'authors') {
      this.structure.publication.authors.splice(index, 1);
    } else {
      this.structure.tags[type].splice(index, 1);
    }
  }

  addTag(event: MatChipInputEvent, type: string): void {
    this.hasBeenEdited = true;
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (type === 'authors') {
        this.structure.publication.authors.push(value.trim());
      } else {
        this.structure.tags[type].push(value.trim());
      }
    }

    if (input) {
      input.value = '';
    }
  }

  formatDate(date: Date): string {
    return (
      this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`
    );
  }

  formatPublishDate(date: Array<string>): string {
    if (date.length > 1) {
      return date[1] === '00'
        ? date[0]
        : this.months[parseInt(date[1], 10) - 1] + ' ' + date[0];
    } else {
      return this.formatDate(new Date(date[0]));
    }
  }

  addhttp(url: string): string {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }
}
