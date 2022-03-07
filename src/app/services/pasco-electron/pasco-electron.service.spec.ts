import { TestBed } from '@angular/core/testing';

import { PascoElectronService } from './pasco-electron.service';

describe('PascoElectronService', () => {
  let service: PascoElectronService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PascoElectronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
