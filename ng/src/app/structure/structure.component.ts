import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Structure, ApiService, StructureService, User } from '../core';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})
export class StructureComponent implements OnInit {
  id: number;
  structure: Structure;
  months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec'];
  files = {};
  isAuthor: boolean;
  isEditing = false;
  hasBeenEdited = false;

  constructor(private structureService: StructureService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = parseInt(params.get('id'), 10);
      this.getStructure();
    });

  }

  getStructure(): void {
    this.structureService.get(this.id)
      .subscribe(
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

  onLoadHandler(): void {
    const frame = document.getElementById('oxview-frame') as HTMLFrameElement;
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
      return date[1] === '00' ? date[0] : this.months[parseInt(date[1], 10)] + ' ' + date[0];
    }
    else {
      // const newDate = new Date(date[0]);
      return this.formatDate(new Date(date[0]));
    }
  }

}

