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
  images = [{path: 'https://th.bing.com/th/id/OIP.1YM53mG10H_U25iPjop83QHaEo?w=295&h=184&c=7&o=5&dpr=2&pid=1.7'}, {path: 'https://th.bing.com/th/id/OIP.GIq5_M59D1-QGif6yU4WYAHaFj?w=239&h=180&c=7&o=5&dpr=2&pid=1.7'},{path: 'https://gsr.dev/material2-carousel/assets/demo.png'}, {path: 'https://gsr.dev/material2-carousel/assets/demo.png'}, {path: 'https://gsr.dev/material2-carousel/assets/demo.png'}];
  files = {};

  constructor(private structureService: StructureService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = parseInt(params.get('id'), 10);

      this.structureService.get(this.id)
      .subscribe(
        data => {
          console.log('data', data);
          data.response.uploadDate = new Date(data.response.uploadDate);
          data.response.publication.publishDate = data.response.publication.publishDate.split('-');


          // Read file contents
          const fileStrings = data.response.files_contents;
          const type = { type: 'text/plain' };
          const files = fileStrings.map(file => new File([new Blob([file.contents], type)], file.name, type));
          data.response.files_contents = files;

          this.structure = data.response;
          console.log("Loaded structure: ", this.structure);
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

  formatPublishDate(date: Array<string>): string {
    return date[1] === '00' ? date[0] : this.months[parseInt(date[1])] + ' ' + date[0];
  }

}

