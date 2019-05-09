import { Component } from '@angular/core';

import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  // results: Set<Acctax | Comtax | Syntax>;
  results: Array<Acctax | Comtax | Syntax> = [];
  results_keys: Array<string> = [];
  isQueryComplete: boolean;

  constructor(private resultsService: ResultsService) {
    this.resultsService.isQueryComplete.subscribe(value => {
      this.isQueryComplete = value;
    });
  }

  render_results(results: Set<Acctax | Comtax | Syntax>) {
    console.log(this.isQueryComplete);
    this.results = Array.from(results.values());
    this.results_keys = Object.keys(this.results);

    for(let result of this.results_keys) {
      console.log(result);
    }

    console.log(this.isQueryComplete);
  }

}
