import { Component } from '@angular/core';
import { MapService } from './core/map/map.service';

// import { startWith, tap, delay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OBIS Search';
  isResultLoaded: boolean;

  constructor(private mapService: MapService) {
    this.mapService.isResultLoaded.subscribe(value => {
      this.isResultLoaded = value;
    });
  }

  // ngAfterViewInit() {
  //   this.mapService.isResultLoaded.pipe(
  //     startWith(null),
  //     delay(0),
  //     tap(() => this.mapService.isResultLoaded.subscribe(value => {
  //       this.isResultLoaded = value
  //     }))
  //   ).subscribe();
  // }
}
