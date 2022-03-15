import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SparrowContextMenuComponent } from './sparrow-context-menu.component';


describe('SparrowContextMenuComponent', () => {
  let component: SparrowContextMenuComponent;
  let fixture: ComponentFixture<SparrowContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SparrowContextMenuComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SparrowContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
