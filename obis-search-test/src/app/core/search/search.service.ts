import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../api/api.service'

import { Api_Response } from '../../models/api_response';
import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';
import { CommaExpr } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private response: Api_Response;
  private results: Array<Acctax | Comtax | Syntax> = [];

  constructor(private httpClient: HttpClient, private apiService: ApiService) { }

  isAcctax(arg: any) {
    return arg.acctax !== undefined;
  }

  isComtax(arg: any) {
    return arg.comtax !== undefined;
  }

  isSyntax(arg: any) {
    return arg.syntax !== undefined;
  }

  get_results() {
    return this.results;
  }

  query_api(query: string): void {
    this.apiService.get_query("acctax", "sname", query).subscribe((response: Api_Response) => {
      this.response = response;

      this.parse_response(this.response, 0, "acctax");

      this.apiService.get_query("acctax", "genus", query).subscribe((response: Api_Response) => {
        this.response = response;

        this.parse_response(this.response, 0, "acctax");

        this.apiService.get_query("acctax", "species", query).subscribe((response: Api_Response) => {
          this.response = response;

          this.parse_response(this.response, 0, "acctax");

          this.apiService.get_query("syntax", "sname", query).subscribe((response: Api_Response) => {
            this.response = response;

            this.parse_response(this.response, 0, "syntax");

            this.apiService.get_query("comtax", "vernacularname", query).subscribe((response: Api_Response) => {
              this.response = response;

              this.parse_response(this.response, 0, "comtax");

              this.results.sort(this.compare);

              console.log(this.results.length);
              for(let a of this.results) {
                console.log(a);
              }
            });
          });
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

  compare(a: Acctax | Comtax | Syntax, b: Acctax | Comtax | Syntax) {
    if((this.isAcctax(a) || this.isSyntax(a)) && (this.isAcctax(b) || this.isSyntax(b))) {
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
    } else if(this.isComtax(a) && this.isComtax(b)) {
      a = <Comtax>(a);
      b = <Comtax>(b);

      if(a.vname < b.vname) {
        return -1;
      } else if(a.vname > b.vname) {
        return 1;
      } else {
        return 0;
      }
    } else if((this.isAcctax(a) || this.isSyntax(a)) && this.isComtax(b)) {
      a = <Acctax | Syntax>(a);
      b = <Comtax>(b);

      if(a.family == "Terrestrial Community" || a.family == "National Vegetation Classification" || a.family == "Subterranean Community" || a.family == "Freshwater Community" || a.family == "Animal Assemblage") {
        return 1;
      }
      
      return -1;
    } else if(this.isComtax(a) && (this.isAcctax(b) || this.isSyntax(b))) {
      a = <Comtax>(a);
      b = <Acctax | Syntax>(b);

      if(b.family == "Terrestrial Community" || b.family == "National Vegetation Classification" || b.family == "Subterranean Community" || b.family == "Freshwater Community" || b.family == "Animal Assemblage") {
        return -1;
      }

      return 1;
    }
  }
}
