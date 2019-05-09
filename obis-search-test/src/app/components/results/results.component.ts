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

  constructor() { }

  render_results(results: Set<Acctax | Comtax | Syntax>) {
    results.forEach(function(r) {
      console.log(r);
    });
  }

}
