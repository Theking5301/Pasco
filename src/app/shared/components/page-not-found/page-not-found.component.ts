import { Component, OnInit } from '@angular/core';
import { Logger } from '../../../../../app/utilities/Logger';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    Logger.info('PageNotFoundComponent INIT');
  }
}
