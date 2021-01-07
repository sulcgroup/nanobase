import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Structure, ApiService, StructureService } from '../core';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.css']
})
export class StructureComponent implements OnInit {
  id: number;
  structure: Structure;
  months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec'];

  constructor(private structureService: StructureService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = parseInt(params.get('id'), 10);

      this.structureService.get(this.id)
      .subscribe(
        data => {
          console.log('data', data);
          data.response.uploadDate = new Date(data.response.uploadDate);
          const fileStrings = data.response.files_contents;
          const type = { type: 'text/plain' };
          const files = fileStrings.map(file => new File([new Blob([file.contents], type)], file.name, type));
          data.response.files_contents = files;

          this.structure = data.response;
        },
        err => console.log('err', err)
      );
    });

  }

  onLoadHandler(): void {
    const frame = document.getElementById('oxview-frame') as HTMLFrameElement;
    frame.contentWindow.postMessage({files: this.structure.files_contents}, 'http://localhost:8000');
  }

  formatDate(date: Date): string {
    return this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`;
  }

}

