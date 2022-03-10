import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserComponent } from './components/browser/browser.component';
import { DetailRoutingModule } from './detail/detail-routing.module';


const routes: Routes = [
  {
    path: '**',
    component: BrowserComponent
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
