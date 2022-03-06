import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserTabComponent } from './browser-tab.component';

describe('BrowserTabComponent', () => {
  let component: BrowserTabComponent;
  let fixture: ComponentFixture<BrowserTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
