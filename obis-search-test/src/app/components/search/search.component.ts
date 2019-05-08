import { Component } from '@angular/core';

import { ApiService } from '../../core/api/api.service';

import { Api_Response } from '../../models/api_response';
import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  private query: string;

  private response: Api_Response;
  private results: Array<Acctax | Comtax | Syntax> = [];

  constructor(private apiService: ApiService) { }

  search(query: string): void {
    this.query = query;

    this.apiService.get_query("acctax", "sname", query).subscribe((response: Api_Response) => {
      this.response = response;

      this.get_results(this.response, 0, "acctax");
    });
  }

  get_results(response: Api_Response, count: number, type: string) {
    var new_count = (response.count - response.results.length) - count;
    var next_url = response.next;

    for(let result of response.results) {
      if(type == "acctax") {
        result = <Acctax>result;
      } else if(type == "comtax") {
        result = <Comtax>result;
      } else if(type == "syntax") {
        result = <Syntax>result;
      }

      this.results.push(result);
      count++;
    }

    if(new_count > 0) {
      next_url = next_url.replace("http", "https");

      this.apiService.get_url(next_url).subscribe((response: Api_Response) => {
        this.response = response;

        this.get_results(this.response, count, "acctax");
      });
    } else {
      for(let a of this.results) {
        console.log(a);
      }
      console.log(this.results.length);
    }
  }

}
