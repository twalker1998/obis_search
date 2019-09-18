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
  }

  clearResult(): void {
    this.results = new Array<Acctax | Comtax | Syntax>();
    this.router.navigate(["./"]);
  }

  createCookie(name: string, value: string): void {
    document.cookie = name + "=" + value + "; path=/";
  }

  getCookie(name: string): string {
    if(document.cookie.length > 0) {
      let start = document.cookie.indexOf(name + "=");

      if(start != -1) {
        start = start + name.length + 1;
        let end = document.cookie.indexOf(";", start);

        if(end == -1) {
          end = document.cookie.length;
        }

        return unescape(document.cookie.substring(start, end));
      }
    }

    return "";
  }
}
