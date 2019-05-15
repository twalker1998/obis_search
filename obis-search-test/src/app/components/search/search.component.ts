import { Component } from '@angular/core';

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
  isQueryComplete: boolean;

  constructor(private searchService: SearchService, private resultsService: ResultsService) {
    this.resultsService.isQueryComplete.subscribe(value => {
      if(value == true) {
        this.results = this.searchService.get_results();

        for(let r of this.results) {
          console.log(r);
        }
      }

      this.isQueryComplete = value;
    });
  }

  search(query: string): void {
    this.searchService.query_api(query);
  }
}
