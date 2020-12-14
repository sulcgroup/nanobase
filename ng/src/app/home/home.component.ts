import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StructureService, StructureCover } from 'src/app/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  numStructures: 20;
  structures: Array<StructureCover> = [];
  months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec'];

  constructor(private structService: StructureService) { }

  ngOnInit(): void {
    this.structService.get_recent(this.numStructures).subscribe(
      data => {
        console.log('data', data);
        data.forEach((structure, i) => data[i].uploadDate = new Date(structure.uploadDate));
        this.structures = data;
        console.log(this.structures[0]);
      },
      err => console.log('err', err)
    );
  }

  dateFormat(date: Date): string {
    return this.months[date.getMonth()] + ` ${date.getDate()}, ${date.getFullYear()}`;
  }

}
