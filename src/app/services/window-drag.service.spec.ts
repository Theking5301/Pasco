import { TestBed } from '@angular/core/testing';

import { WindowDragService } from './window-drag.service';

describe('WindowDragService', () => {
  let service: WindowDragService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowDragService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
