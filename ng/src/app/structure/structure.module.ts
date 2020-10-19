import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StructureRoutingModule } from './structure-routing.module';
import { StructureComponent } from './structure.component';


@NgModule({
  declarations: [StructureComponent],
  imports: [
    CommonModule,
    StructureRoutingModule
  ]
})
export class StructureModule { }
