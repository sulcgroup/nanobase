import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchStrcturesComponent } from './search-strctures/search-strctures.component';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [HomeComponent, SearchStrcturesComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MaterialModule,
  ],
})
export class HomeModule {}
