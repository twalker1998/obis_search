import { Component } from '@angular/core';

import { ApiService } from '../../core/api/api.service';

import { Api_Response } from '../../models/api_response';
import { Acctax } from '../../models/acctax';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  private query: string;

  private acctax_response: Api_Response;
  private acctax: Acctax[] = [];

  constructor(private apiService: ApiService) { }

  search(query: string): void {
    this.query = query;

    this.apiService.get_acctax(query).subscribe((response: Api_Response) => {
      this.acctax_response = response;

      this.get_results(this.acctax_response, 0);
    });
  }

  get_results(response: Api_Response, count: number) {
    var new_count = (response.count - response.results.length) - count;
    var next_url = response.next;

    for(let result of response.results) {
      this.acctax.push(result);
      count++;
    }

    if(new_count > 0) {
      next_url = next_url.replace("http", "https");

      this.apiService.get_acctax_url(next_url).subscribe((response: Api_Response) => {
        this.acctax_response = response;

        this.get_results(this.acctax_response, count);
      });
    } else {
      for(let a of this.acctax) {
        console.log(a);
      }
      console.log(this.acctax.length);
    }
  }

}
