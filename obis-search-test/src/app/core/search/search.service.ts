import { Injectable } from '@angular/core';

import { ApiService } from '../api/api.service';
import { ResultsService } from '../results/results.service';

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

  constructor(private apiService: ApiService, private resultsService: ResultsService) { }

  get_results(): Array<Acctax | Comtax | Syntax> {
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

          this.results.sort(this.compare);

          this.remove_duplicates();

          this.resultsService.isQueryComplete.next(true);
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
        result.display_name = result.sname;
      } else if(type == "comtax") {
        result = <Comtax>result;
        result.type = "comtax";
        result.display_name = result.vernacularname;
      } else if(type == "syntax") {
        result = <Syntax>result;
        result.type = "syntax";
        result.display_name = result.sname;
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

  remove_duplicates() {
    this.results.forEach((r, i) => {
      if(r.type === 'acctax' || r.type === 'syntax') {
        r = <Acctax | Syntax>(r);

        for(let j = i + 1; j < this.results.length; j++) {
          if(this.results[j].type === 'acctax' || this.results[j].type === 'syntax') {
            let s = <Acctax | Syntax>(this.results[j]);

            if(s.sname === r.sname) {
              this.results.splice(j, 1);
            }
          }
        }
      } else if(r.type === 'comtax') {
        r = <Comtax>(r);

        for(let j = i + 1; j < this.results.length; j++) {
          if(this.results[j].type === 'comtax') {
            let s = <Comtax>(this.results[j]);

            if(s.vname === r.vname) {
              this.results.splice(j, 1);
            }
          }
        }
      }
    });
  }
}
