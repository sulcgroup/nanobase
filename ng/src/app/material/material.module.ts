import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';

import { MatChipsModule } from '@angular/material/chips';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';

import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    MatSidenavModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSliderModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatProgressBarModule,
    MatCardModule,
    MatSlideToggleModule,
  ],
})
export class MaterialModule {}
