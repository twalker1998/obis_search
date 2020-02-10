import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { SearchComponent } from './components/search/search.component';

import { ResultsService } from './core/results/results.service';
import { MapService } from './core/map.service';
import { AppRoutingModule } from './app-routing.module';
import { ResultComponent } from './components/result/result.component';
import { DistributionMapComponent } from './components/distribution-map/distribution-map.component';
import { MapComponent } from './components/map/map.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    ResultComponent,
    DistributionMapComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [ResultsService, MapService],
  bootstrap: [AppComponent]
})
export class AppModule { }
