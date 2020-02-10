import { Component, HostListener, Input, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

import { MapService } from '../../core/map.service';
import { ResultsService } from '../../core/results.service';
import { SearchService } from '../../core/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements AfterViewInit {
  @Input() location: string;

  results: Array<Acctax | Comtax | Syntax> = [];
  isQueryStarted: boolean;
  isQueryComplete: boolean;
  page = 1;
  pageSize = 15;

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    const resultsStr = localStorage.getItem('results');
    this.results = JSON.parse(resultsStr);
    this.resultsService.isQueryStarted.next(false);
    this.resultsService.isQueryComplete.next(true);
    this.mapService.changeAcode('search');
  }

  constructor(private searchService: SearchService, private resultsService: ResultsService,
              private mapService: MapService, private router: Router) {
    this.resultsService.isQueryStarted.subscribe(sValue => {
      this.isQueryStarted = sValue;
    });

    this.resultsService.isQueryComplete.subscribe(cValue => {
      if (cValue) {
        this.isQueryStarted = false;
        if (this.searchService.get_results().length === 0) {
          const resultsStr = localStorage.getItem('results');

          if (!resultsStr) {
            this.results = new Array<Acctax | Comtax | Syntax>();
          } else {
            this.results = JSON.parse(resultsStr);
          }

          this.searchService.set_results(this.results);
          this.searchService.get_taxa_strings();
        } else {
          this.results = this.searchService.get_results();
          const resultsStr = JSON.stringify(this.results);
          localStorage.setItem('results', resultsStr);
        }
      }

      this.isQueryComplete = cValue;
    });
  }

  ngAfterViewInit() {
    let searchBar: HTMLElement;
    let submitSearch: HTMLElement;

    if (this.location === 'main') {
      searchBar = document.getElementById('query_main');
      submitSearch = document.getElementById('submitSearch_main');
    } else if (this.location === 'map') {
      searchBar = document.getElementById('query_map');
      submitSearch = document.getElementById('submitSearch_map');
    }

    // tslint:disable-next-line: only-arrow-functions
    searchBar.addEventListener('keyup', function(event) {
      // tslint:disable-next-line: deprecation
      if (event.keyCode === 13) {
        event.preventDefault();

        submitSearch.click();
      }
    });

    this.searchService.query.subscribe(query => {
      this.updateQueryValue(query);
    });
  }

  search(query: string): void {
    this.clearResult();
    this.page = 1;
    this.searchService.query_api(query);
    this.resultsService.isQueryStarted.next(true);
    this.resultsService.isQueryComplete.next(false);
    this.mapService.changeAcode('search');
    this.searchService.updateQuery(query);
  }

  clearResult(): void {
    this.results = new Array<Acctax | Comtax | Syntax>();
    localStorage.removeItem('results');
    this.router.navigate(['./']);
    this.searchService.updateQuery('');
  }

  updateQueryValue(query: string) {
    if (this.location === 'main') {
      (document.getElementById('query_map') as HTMLInputElement).value = query;
    } else if (this.location === 'map') {
      (document.getElementById('query_main') as HTMLInputElement).value = query;
    }
  }
}
