import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';

import { MatChipsModule } from '@angular/material/chips';
@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [MatSidenavModule, MatChipsModule],
})
export class MaterialModule {}
