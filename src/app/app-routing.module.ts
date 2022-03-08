import { BrowserPaneContainerComponent } from './components/browser-pane-container/browser-pane-container.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { DetailRoutingModule } from './detail/detail-routing.module';
import { BrowserComponent } from './components/browser/browser.component';

const routes: Routes = [
  {
    path: '',
    component: BrowserComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    DetailRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
