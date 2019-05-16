import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

import { SearchService } from '../../core/search/search.service';
import { ResultsService } from '../../core/results/results.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  results: Array<Acctax | Comtax | Syntax> = [];
  isQueryStarted: boolean;
  isQueryComplete: boolean;
  isError: boolean;
  page = 1;
  pageSize = 15;

  constructor(private searchService: SearchService, private resultsService: ResultsService, private router: Router) {
    this.resultsService.isQueryStarted.subscribe(s_value => {
      this.isQueryStarted = s_value;
    });

    this.resultsService.isQueryComplete.subscribe(c_value => {
      if(c_value) {
        this.isQueryStarted = false;
        this.results = new Array<Acctax | Comtax | Syntax>();
        this.results = this.searchService.get_results();
      }

      this.isQueryComplete = c_value;
    });

    this.resultsService.isError.subscribe(e_value => {
      this.isError = e_value;
    });
  }

  search(query: string): void {
    this.clearResult();
    this.page = 1;
    this.searchService.query_api(query);
    this.resultsService.isQueryStarted.next(true);
    this.resultsService.isQueryComplete.next(false);
  }

  clearResult(): void {
    this.results = new Array<Acctax | Comtax | Syntax>();
    this.router.navigate(["./"]);
  }
}
