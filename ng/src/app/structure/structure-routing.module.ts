import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StructureComponent } from './structure.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: ':id', component: StructureComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StructureRoutingModule { }
