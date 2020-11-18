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

  constructor(private structService: StructureService) { }

  ngOnInit(): void {
    this.structService.get_recent(this.numStructures).subscribe(
      data => {
        console.log('data', data);
        this.structures = data;
      },
      err => console.log('err', err)
    );
  }

}
