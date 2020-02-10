import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { DistributionMapComponent } from './components/distribution-map/distribution-map.component';
import { MapComponent } from './components/map/map.component';
import { ResultComponent } from './components/result/result.component';
import { SearchComponent } from './components/search/search.component';

import { MapService } from './core/map.service';
import { ResultsService } from './core/results.service';

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
