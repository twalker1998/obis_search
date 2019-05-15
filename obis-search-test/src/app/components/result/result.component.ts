import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ResultsService } from '../../core/results/results.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  acode: string;

  constructor(private route: ActivatedRoute, private resultsService: ResultsService) { }

  ngOnInit() {
    this.resultsService.isQueryComplete.next(false);
    
    this.route.paramMap.subscribe(params => {
      this.acode = params.get("acode");
    });
  }
}
