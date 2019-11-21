import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

import { SearchService } from '../../core/search/search.service';
import { ResultsService } from '../../core/results/results.service';
import { MapService } from '../../core/map/map.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  results: Array<Acctax | Comtax | Syntax> = [];
  isQueryStarted: boolean;
  isQueryComplete: boolean;
  page = 1;
  pageSize = 15;

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    let results_str = localStorage.getItem("results");
    this.results = JSON.parse(results_str);
    this.resultsService.isQueryStarted.next(false);
    this.resultsService.isQueryComplete.next(true);
    this.mapService.changeAcode("search");
  }

  constructor(private searchService: SearchService, private resultsService: ResultsService, private mapService: MapService, private router: Router) {
    this.resultsService.isQueryStarted.subscribe(s_value => {
      this.isQueryStarted = s_value;
    });

    this.resultsService.isQueryComplete.subscribe(c_value => {
      if(c_value) {
        this.isQueryStarted = false;
        if(this.searchService.get_results().length == 0) {
          let results_str = localStorage.getItem("results");
          this.results = JSON.parse(results_str);
          this.searchService.set_results(this.results);
          this.searchService.get_taxa_strings();
        } else {
          this.results = this.searchService.get_results();

          let results_str = JSON.stringify(this.results);
          localStorage.setItem("results", results_str);
        }
      }

      this.isQueryComplete = c_value;
    });
  }

  ngOnInit() {
    var search_bar = document.getElementById("query");

    search_bar.addEventListener("keyup", function(event) {
      if(event.keyCode === 13) {
        event.preventDefault();

        document.getElementById("submitSearch").click();
      }
    });
  }

  search(query: string): void {
    this.clearResult();
    this.page = 1;
    this.searchService.query_api(query);
    this.resultsService.isQueryStarted.next(true);
    this.resultsService.isQueryComplete.next(false);
    this.mapService.changeAcode("search");
  }

  clearResult(): void {
    this.results = new Array<Acctax | Comtax | Syntax>();
    localStorage.removeItem("results");
    this.router.navigate(["./"]);
  }
}
