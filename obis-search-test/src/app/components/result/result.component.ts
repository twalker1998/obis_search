import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../core/api/api.service';
import { SearchService } from '../../core/search/search.service';
import { ResultsService } from '../../core/results/results.service';
import { MapService } from '../../core/map/map.service';

import { MapComponent } from '../../components/map/map.component';

import { Api_Response } from '../../models/api_response';
import { Acctax } from 'src/app/models/acctax';
import { Comtax } from 'src/app/models/comtax';
import { Syntax } from 'src/app/models/syntax';
import { Occurrence } from 'src/app/models/occurrence';
import { OccurrenceData } from 'src/app/models/occurrence_data';
import { formatDate } from '@angular/common';

declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

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

  private areSynsLoaded = false;
  private areVNamesLoaded = false;
  private isSwapLoaded = false;
  private isFedStatusLoaded = false;
  private isStStatusLoaded = false;
  private isTaxaBuilt = false;

  constructor(private route: ActivatedRoute, private apiService: ApiService, private searchService: SearchService, private resultsService: ResultsService, private mapService: MapService, private mapComponent: MapComponent) { }

  ngOnInit() {
    this.resultsService.isQueryComplete.next(false);

    this.route.paramMap.subscribe(params => {
      this.acode = params.get("acode");
      this.build_info();

      this.mapService.isResultLoaded.next(true);
      this.mapComponent.initializeMap(this.acode);
    });
  }

  async build_info() {
    this.list_result = this.searchService.get(this.acode);

    if(!this.list_result || this.list_result.type !== 'acctax') {
      let results_str: string = localStorage.getItem("results");
      let results_arr: Array<Acctax | Comtax | Syntax> = JSON.parse(results_str);

      this.list_result = this.searchService.get(this.acode, results_arr);

      if(!this.list_result || this.list_result.type !== 'acctax') {
        this.result = await this.apiService.get_url_promise("https://obis.ou.edu/api/obis/acctax/" + this.acode + "/?format=json", "acctax");
      } else if(this.list_result.type === 'acctax') {
        this.result = <Acctax>(this.list_result);
      }
    } else if(this.list_result.type === 'acctax') {
      this.result = <Acctax>(this.list_result);
    }

    await this.get_swap(this.result);
    await this.get_fed_status(this.result);
    await this.get_st_status(this.result);

    if(this.result.acode != this.result.elcode) {
      this.response = await this.apiService.get_query("comtax", "acode", this.acode);

      await this.get_vnames(this.response);

      this.response = await this.apiService.get_query("syntax", "acode", this.acode);

      await this.get_synonyms(this.response);

      await this.build_taxa();
    } else {
      this.areVNamesLoaded = true;
      this.areSynsLoaded = true;
      this.isTaxaBuilt = true;
    }

    await this.get_occurrences();
  }

  async get_swap(result: Acctax) {
    if(!result.swap) {
      this.swap_status = "Not Included";
    } else {
      let base_url = result.swap.replace("http", "https");

      let swap_response = await this.apiService.get_url_promise(base_url + "?format=json", "swap");
      
      this.swap_status = swap_response.tier;
    }

    this.isSwapLoaded = true;
  }

  async get_fed_status(result: Acctax) {
    if(!result.fed_status) {
      this.fed_status = "Not Listed";
    } else {
      let base_url = result.fed_status.replace("http", "https");

      let fed_status_response = await this.apiService.get_url_promise(base_url + "?format=json", "fed_status");
      
      this.fed_status = fed_status_response.description;
    }

    this.isFedStatusLoaded = true;
  }

  async get_st_status(result: Acctax) {
    if(!result.st_status) {
      this.st_status = "Not Listed";
    } else {
      let base_url = result.st_status.replace("http", "https");

      let st_status_response = await this.apiService.get_url_promise(base_url + "?format=json", "st_status");
      
      this.st_status = st_status_response.description;
    }

    this.isStStatusLoaded = true;
  }

  async get_vnames(response: Api_Response) {
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

    this.areVNamesLoaded = true;
  }

  async get_synonyms(response: Api_Response) {
    for(let r of response.results) {
      r = <Syntax>(r);

      this.synonyms.push(r.sname);
    }

    this.areSynsLoaded = true;
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

    this.isTaxaBuilt = true;
  }

  async get_occurrences() {
    this.apiService.get_occurrence_data(this.result.sname).subscribe((data: OccurrenceData) => {
      for(let record of data.table) {
        let is_date: boolean = true;

        if(record.min_date.toString() === 'No Date Listed') {
          is_date = false;
        }

        let occurrence: Occurrence = {county: record.county, count: record.count, min_date: record.min_date, max_date: record.max_date, is_date};

        this.occurrences.push(occurrence);
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

  export(type: string) {
    let rows = [];

    for(let occurrence of this.occurrences) {
      let row: any = [];
      if(type == "csv") {
        row = [occurrence.county, occurrence.count, occurrence.min_date, occurrence.max_date].join('","');
      } else if(type == "pdf") {
        if(occurrence.is_date) {
          row = [occurrence.county, occurrence.count, formatDate(occurrence.min_date, "longDate", "en"), formatDate(occurrence.max_date, "longDate", "en")];
        } else if(!occurrence.is_date) {
          row = [occurrence.county, occurrence.count, "No Date Listed", "No Date Listed"];
        }
      }
      rows.push(row);
    }

    if(type == "csv") {
      let filename = this.result.sname + ".csv";

      rows.unshift('"County","Count","Min Event Date","Max Event Date');
      let csv = rows.join('"\r\n"') + '"';

      this.download(filename, csv);
    } else if(type == "pdf") {
      let filename = this.result.sname + ".pdf";

      let doc = new jsPDF();
      let col = [["County", "Count", "Min Event Date", "Max Event Date"]];

      doc.autoTable({
        head: col,
        headStyles: {
          fillColor: [84, 130, 53]
        },
        body: rows
      });

      doc.save(filename);
    }
  }
}
