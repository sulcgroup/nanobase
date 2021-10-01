import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HowToRoutingModule } from './how-to-routing.module';
import { HowToComponent } from './how-to.component';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [HowToComponent],
  imports: [
    CommonModule,
    HowToRoutingModule,
    MatDividerModule
  ]
})
export class HowToModule { }
