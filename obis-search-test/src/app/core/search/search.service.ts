import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ResultsComponent } from '../../components/results/results.component';

import { ApiService } from '../api/api.service';

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

  constructor(private httpClient: HttpClient, private apiService: ApiService, private resultsComp: ResultsComponent) { }

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

          this.results.sort(this.compare);

          var unique_results = new Set(this.results);

          this.resultsComp.render_results(unique_results);
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
        result.type = "acctax";
      } else if(type == "comtax") {
        result = <Comtax>result;
        result.type = "comtax";
      } else if(type == "syntax") {
        result = <Syntax>result;
        result.type = "syntax";
      }

      this.results.push(result);
      count++;
    }

    if(new_count > 0) {
      next_url = next_url.replace("http", "https");

      this.apiService.get_url(next_url).subscribe((response: Api_Response) => {
        this.response = response;

        this.parse_response(this.response, count, type);
      });
    }
  }

  compare(a: Acctax | Syntax | Comtax, b: Acctax | Syntax | Comtax) {
    if((a.type === 'acctax' || a.type === 'syntax') && (b.type === 'acctax' || b.type === 'syntax')) {
      a = <Acctax | Syntax>(a);
      b = <Acctax | Syntax>(b);

      if(a.sname < b.sname) {
        if(a.family == "Terrestrial Community" || a.family == "National Vegetation Classification" || a.family == "Subterranean Community" || a.family == "Freshwater Community" || a.family == "Animal Assemblage") {
          return 1;
        }

        return -1;
        } else if(a.sname > b.sname) {
          if(b.family == "Terrestrial Community" || b.family == "National Vegetation Classification" || b.family == "Subterranean Community" || b.family == "Freshwater Community" || b.family == "Animal Assemblage") {
            return -1;
          }

          return 1;
        } else {
          if(a.family == "Terrestrial Community" || a.family == "National Vegetation Classification" || a.family == "Subterranean Community" || a.family == "Freshwater Community" || a.family == "Animal Assemblage") {
            return 1;
          }

          if(b.family == "Terrestrial Community" || b.family == "National Vegetation Classification" || b.family == "Subterranean Community" || b.family == "Freshwater Community" || b.family == "Animal Assemblage") {
            return -1;
          }

          return 0;
      }
    } else if(a.type === 'comtax' && b.type === 'comtax') {
      a = <Comtax>(a);
      b = <Comtax>(b);

      if(a.vname < b.vname) {
        return -1;
      } else if(a.vname > b.vname) {
        return 1;
      } else {
        return 0;
      }
    } else if((a.type === 'acctax' || a.type === 'syntax') && b.type === 'comtax') {
      a = <Acctax | Syntax>(a);

      if(a.family == "Terrestrial Community" || a.family == "National Vegetation Classification" || a.family == "Subterranean Community" || a.family == "Freshwater Community" || a.family == "Animal Assemblage") {
        return 1;
      }

      return -1;
    } else if(a.type === 'comtax' && (b.type === 'acctax' || b.type === 'syntax')) {
      b = <Acctax | Syntax>(b);

      if(b.family == "Terrestrial Community" || b.family == "National Vegetation Classification" || b.family == "Subterranean Community" || b.family == "Freshwater Community" || b.family == "Animal Assemblage") {
        return -1;
      }

      return 1;
    }
  }
}
