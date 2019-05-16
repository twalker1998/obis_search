import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../core/api/api.service';
import { SearchService } from '../../core/search/search.service';
import { ResultsService } from '../../core/results/results.service';

import { Api_Response } from '../../models/api_response';
import { Acctax } from 'src/app/models/acctax';
import { Comtax } from 'src/app/models/comtax';
import { Syntax } from 'src/app/models/syntax';
import { Swap } from 'src/app/models/swap';
import { FedStatus } from 'src/app/models/fed_status';
import { StateStatus } from 'src/app/models/st_status';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  acode: string;
  result: Acctax | Comtax | Syntax;
  synonyms: Array<string> = [];
  primary_vname: string;
  other_vnames: Array<string> = [];
  swap_status: string;
  fed_status: string;
  st_status: string;

  constructor(private route: ActivatedRoute, private apiService: ApiService, private searchService: SearchService, private resultsService: ResultsService) { }

  ngOnInit() {
    this.resultsService.isQueryComplete.next(false);

    this.route.paramMap.subscribe(params => {
      this.acode = params.get("acode");
      this.build_info();
    });
  }

  build_info() {
    this.result = this.searchService.get(this.acode);

    this.apiService.get_acctax("https://obis.ou.edu/api/obis/acctax/" + this.acode + "/&format=json").subscribe((response: Acctax) => {

      this.get_swap(response);
      this.get_fed_status(response);
      this.get_st_status(response);

      this.apiService.get_query("comtax", "acode", this.acode).subscribe((response: Api_Response) => {

        this.get_vnames(response);

        this.apiService.get_query("syntax", "acode", this.acode).subscribe((response: Api_Response) => {
          
          this.get_synonyms(response);
        });
      });
    });
  }

  get_swap(response: Acctax) {
    if(!response.swap) {
      this.swap_status = "Not Included";
    } else {
      this.apiService.get_swap(response.swap + "?format=json").subscribe((swap_response: Swap) => {
        this.swap_status = swap_response.tier;
      });
    }
  }

  get_fed_status(response: Acctax) {
    if(!response.fed_status) {
      this.fed_status = "Not Listed";
    } else {
      this.apiService.get_fedstatus(response.fed_status + "?format=json").subscribe((fed_status_response: FedStatus) => {
        this.fed_status = fed_status_response.description;
      });
    }
  }

  get_st_status(response: Acctax) {
    if(!response.st_status) {
      this.st_status = "Not Listed";
    } else {
      this.apiService.get_ststatus(response.st_status + "?format=json").subscribe((st_status_response: StateStatus) => {
        this.st_status = st_status_response.description;
      })
    }
  }

  get_vnames(response: Api_Response) {
    if(response.results.length > 1) {
      for(let r of response.results) {
        r = <Comtax>(r);

        if(!r.primary_name) {
          this.primary_vname = r.vname;
        } else {
          this.other_vnames.push(r.vname);
        }
      }
    } else {
      this.primary_vname = response.results[0].vname;
    }
  }

  get_synonyms(response: Api_Response) {
    for(let r of response.results) {
      r = <Syntax>(r);

      this.synonyms.push(r.sname);
    }
  }
}
