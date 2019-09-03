import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../core/api/api.service';
import { SearchService } from '../../core/search/search.service';
import { ResultsService } from '../../core/results/results.service';

import { Api_Response } from '../../models/api_response';
import { Acctax } from 'src/app/models/acctax';
import { Comtax } from 'src/app/models/comtax';
import { Syntax } from 'src/app/models/syntax';
import { Occurrence } from 'src/app/models/occurrence';

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
  occurrences: Array<Occurrence> = [];

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

    await this.get_occ_table();
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
      let family = this.result.family;
      let url = "https://obis.ou.edu/api/obis/hightax/" + family + "/?format=json";

      let response = await this.apiService.get_url_promise(url, "hightax");

      if(response.kingdom) {
        this.result.taxa = response.kingdom + " > " + response.phylum + " > " + response.taxclass + " > " + response.taxorder + " > " + family;
      } else {
        this.result.taxa = "community";
      }
    }

    if(this.result.taxa === "community") {
      return;
    }

    let taxa_arr = this.result.taxa.split(">");

    for(let str of taxa_arr) {
      this.taxa.push(str.trim());
    }
  }

  async get_occ_table() {
    this.apiService.get_occ_table(this.result.sname).subscribe((results: Array<any>) => {
      for(let result of results) {
        for(let county in result) {
          let occurrence = {county: county, count: result[county]}

          this.occurrences.push(occurrence);
        }
      }
    });
  }

  download(filename: string, text: any) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  generate_csv() {
    let filename = this.result.sname + ".csv";
    let firstRow = '"County","Count';
    let colDelim = '","';
    let rowDelim = '"\r\n"';
    let csvRows = [firstRow];

    for(let occurrence of this.occurrences) {
      let row = [occurrence.county, occurrence.count].join(colDelim);
      csvRows.push(row);
    }

    let csv = csvRows.join(rowDelim) + '"';
    this.download(filename, csv);
  }

  generatePDF() {
    let filename = this.result.sname + ".pdf";

    let content: any = [{text: 'Number of Occurrences of ' + this.result.sname + ' in Each County', fontSize: 32}];

    let countyTable: any = [
      [{text: "County", fillColor: '#4CAF50', color: 'white'},
       {text: "Count", fillColor: '#4CAF50', color: 'white'}]
    ];

    for(let occurrence of this.occurrences) {
      let row = [
        {text: String(occurrence.county), fillColor: 'white'},
        {text: String(occurrence.count), fillColor: 'white'}
      ];

      countyTable.push(row);
    }

    let table = {table: {headerRows: 0, widths: ['auto', 'auto'], body: countyTable}};

    content.push(table);

    let docDefinition = {
      content: content
    };
  }
}
