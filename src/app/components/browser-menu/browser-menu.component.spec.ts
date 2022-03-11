import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserMenuComponent } from './browser-menu.component';

describe('BrowserMenuComponent', () => {
  let component: BrowserMenuComponent;
  let fixture: ComponentFixture<BrowserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
