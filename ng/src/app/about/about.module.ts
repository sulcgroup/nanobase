import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { MatDividerModule } from '@angular/material/divider';
import { HomeModule } from '../home/home.module';


@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    AboutRoutingModule,
    MatDividerModule,
    HomeModule
  ]
})
export class AboutModule { }
