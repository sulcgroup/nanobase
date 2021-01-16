import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StructureRoutingModule } from './structure-routing.module';
import { StructureComponent } from './structure.component';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { IvyCarouselModule } from 'angular-responsive-carousel';



@NgModule({
  declarations: [StructureComponent],
  imports: [
    CommonModule,
    StructureRoutingModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule,
    MatBadgeModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule,
    IvyCarouselModule
  ]
})
export class StructureModule { }
