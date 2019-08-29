import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionMapComponent } from './distribution-map.component';

describe('DistributionMapComponent', () => {
  let component: DistributionMapComponent;
  let fixture: ComponentFixture<DistributionMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
