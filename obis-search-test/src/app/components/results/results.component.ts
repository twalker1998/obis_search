import { Component } from '@angular/core';

import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

import { ResultsService } from '../../core/results/results.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  // results: Set<Acctax | Comtax | Syntax>;
  results: Array<string> = [];
  isQueryComplete: boolean;

  constructor(private resultsService: ResultsService) {
    this.resultsService.isQueryComplete.subscribe(value => {
      this.isQueryComplete = value;
    });

    this.results.push("test1");
    this.results.push("test2");
    this.results.push("test3");
    this.results.push("test4");
    this.results.push("test5");
  }

  render_results(results: Set<Acctax | Comtax | Syntax>) {
    // console.log(this.isQueryComplete);
    // this.results = Array.from(results.values());

    for(let result of this.results) {
      console.log(result);
    }

    // console.log(this.isQueryComplete);
  }

}
