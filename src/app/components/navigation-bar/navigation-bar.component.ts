import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pasco-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  private url: string;
  constructor() {
    this.url = 'https://www.flaticon.com/premium-icon/refresh_5794910?related_id=5794910&origin=pack';
  }

  ngOnInit(): void {
  }

}
