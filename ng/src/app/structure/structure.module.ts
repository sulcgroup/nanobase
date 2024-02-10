import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StructureRoutingModule } from './structure-routing.module';
import { StructureComponent } from './structure.component';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
// import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';

// import { IvyCarouselModule } from 'angular-responsive-carousel';

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
    MatSelectModule,
    MatSlideToggleModule,
    FormsModule,
    // MaterialFileInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatRadioModule,
    // IvyCarouselModule
  ],
})
export class StructureModule {}
