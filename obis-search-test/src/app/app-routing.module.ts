import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResultComponent } from './components/result/result.component';
import { SearchComponent } from './components/search/search.component';

const routes: Routes = [
  { path: 'result/:acode', component: ResultComponent },
  { path: './', component: SearchComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
