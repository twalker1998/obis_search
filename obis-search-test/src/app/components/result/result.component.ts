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
  private response: Api_Response;
  acode: string;
  list_result: Acctax | Comtax | Syntax;
  result: Acctax;
  synonyms: Array<string> = [];
  primary_vname: string;
  other_vnames: Array<string> = [];
  swap_status: string;
  fed_status: string;
  st_status: string;
  taxa: Array<string> = [];

  constructor(private route: ActivatedRoute, private apiService: ApiService, private searchService: SearchService, private resultsService: ResultsService) { }

  ngOnInit() {
    this.resultsService.isQueryComplete.next(false);

    this.route.paramMap.subscribe(params => {
      this.acode = params.get("acode");
      this.build_info();
    });
  }

  async build_info() {
    this.list_result = this.searchService.get(this.acode);

    if(!this.list_result || this.list_result.type !== 'acctax') {
      this.result = await this.apiService.get_url_promise("https://obis.ou.edu/api/obis/acctax/" + this.acode + "/?format=json", "acctax");
    } else if(this.list_result.type === 'acctax') {
      this.result = <Acctax>(this.list_result);
    }

    await this.get_swap(this.result);
    await this.get_fed_status(this.result);
    await this.get_st_status(this.result);

    this.response = await this.apiService.get_query("comtax", "acode", this.acode);

    await this.get_vnames(this.response);

    this.response = await this.apiService.get_query("syntax", "acode", this.acode);

    await this.get_synonyms(this.response);

    await this.build_taxa();
  }

  async get_swap(result: Acctax) {
    if(!result.swap) {
      this.swap_status = "Not Included";
    } else {
      let base_url = result.swap.replace("http", "https");

      let swap_response = await this.apiService.get_url_promise(base_url + "?format=json", "swap");
      
      this.swap_status = swap_response.tier;
    }
  }

  async get_fed_status(result: Acctax) {
    if(!result.fed_status) {
      this.fed_status = "Not Listed";
    } else {
      let base_url = result.fed_status.replace("http", "https");

      let fed_status_response = await this.apiService.get_url_promise(base_url + "?format=json", "fed_status");
      
      this.fed_status = fed_status_response.description;
    }
  }

  async get_st_status(result: Acctax) {
    if(!result.st_status) {
      this.st_status = "Not Listed";
    } else {
      let base_url = result.st_status.replace("http", "https");

      let st_status_response = await this.apiService.get_url_promise(base_url + "?format=json", "st_status");
      
      this.st_status = st_status_response.description;
    }
  }

  get_vnames(response: Api_Response) {
    if(response.results.length > 1) {
      for(let r of response.results) {
        r = <Comtax>(r);

        if(r.primary_name) {
          this.primary_vname = r.vernacularname;
        } else {
          this.other_vnames.push(r.vernacularname);
        }
      }
    } else {
      this.primary_vname = response.results[0].vernacularname;
    }
  }

  async get_synonyms(response: Api_Response) {
    for(let r of response.results) {
      r = <Syntax>(r);

      this.synonyms.push(r.sname);
    }
  }

  async build_taxa() {
    if(!this.result.taxa) {

    }


    let taxa_arr = this.result.taxa.split(">");

    for(let str of taxa_arr) {
      this.taxa.push(str.trim());
    }
  }
}
