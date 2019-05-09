import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../api/api.service'

import { Api_Response } from '../../models/api_response';
import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private response: Api_Response;
  private results: Array<Acctax | Comtax | Syntax> = [];

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  get_results() {
    return this.results;
  }

  query_api(query: string): void {
    this.apiService.get_query("acctax", "sname", query).subscribe((response: Api_Response) => {
      this.response = response;

      this.parse_response(this.response, 0, "acctax");

      this.apiService.get_query("syntax", "sname", query).subscribe((response: Api_Response) => {
        this.response = response;

        this.parse_response(this.response, 0, "syntax");

        this.apiService.get_query("comtax", "vernacularname", query).subscribe((response: Api_Response) => {
          this.response = response;

          this.parse_response(this.response, 0, "comtax");

          console.log(this.results.length);
          for(var r of this.results) {
            console.log(r);
          }
        });
      });
    });
  }

  parse_response(response: Api_Response, count: number, type: string) {
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

        this.parse_response(this.response, count, "acctax");
      });
    }
  }
}
