import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HowToComponent } from './how-to.component';

const routes: Routes = [{ path: '', component: HowToComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HowToRoutingModule { }
