import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionMapComponent } from './distribution-map.component';

describe('DistributionMapComponent', () => {
  let component: DistributionMapComponent;
  let fixture: ComponentFixture<DistributionMapComponent>;
  let app: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionMapComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(DistributionMapComponent);
    app = fixture.debugElement.componentInstance;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('verify default values', () => {
    expect(app.basemap).toEqual(jasmine.any(String));
    expect(app.center).toEqual(jasmine.any(Array));
    expect(app.zoom).toEqual(jasmine.any(Number));
    expect(app.mapLoaded).toEqual(false);
  });
});
