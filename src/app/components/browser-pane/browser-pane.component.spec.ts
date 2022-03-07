import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserPaneComponent } from './browser-pane.component';

describe('BrowserPaneComponent', () => {
  let component: BrowserPaneComponent;
  let fixture: ComponentFixture<BrowserPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowserPaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
