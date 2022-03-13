import { TestBed } from '@angular/core/testing';
import { SparrowElectronService } from './sparrow-electron.service';


describe('SparrowElectronService', () => {
  let service: SparrowElectronService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SparrowElectronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
