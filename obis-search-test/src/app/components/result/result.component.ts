import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { DbService } from '../../core/db.service';
import { SearchService } from '../../core/search.service';
import { ResultsService } from '../../core/results.service';
import { MapService } from '../../core/map.service';

import { ApiResponse } from '../../models/api-response';
import { Acctax } from 'src/app/models/acctax';
import { Comtax } from 'src/app/models/comtax';
import { Syntax } from 'src/app/models/syntax';
import { Occurrence } from 'src/app/models/occurrence';
import { OccurrenceData } from 'src/app/models/occurrence-data';
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
  private response: ApiResponse;
  acode: string;
  listResult: Acctax | Comtax | Syntax;
  result: Acctax;
  synonyms: Array<string> = [];
  primaryVname: string;
  otherVnames: Array<string> = [];
  swapStatus: string;
  fedStatus: string;
  stStatus: string;
  taxa: Array<string> = [];
  occurrences: Array<Occurrence> = [];

  areSynsLoaded = false;
  areVNamesLoaded = false;
  isSwapLoaded = false;
  isFedStatusLoaded = false;
  isStStatusLoaded = false;
  isTaxaBuilt = false;

  constructor(private route: ActivatedRoute, private apiService: ApiService, private dbService: DbService,
              private searchService: SearchService, private resultsService: ResultsService, private mapService: MapService) { }

  ngOnInit() {
    this.resultsService.isQueryComplete.next(false);

    this.route.paramMap.subscribe(params => {
      this.acode = params.get('acode');
      this.build_info();

      this.mapService.changeAcode(this.acode);
    });
  }

  async build_info() {
    this.listResult = this.searchService.get(this.acode);

    if (!this.listResult || this.listResult.type !== 'acctax') {
      const resultsStr: string = localStorage.getItem('results');
      const resultsArr: Array<Acctax | Comtax | Syntax> = JSON.parse(resultsStr);

      this.listResult = this.searchService.get(this.acode, resultsArr);

      if (!this.listResult || this.listResult.type !== 'acctax') {
        this.result = await this.apiService.get_url_promise('https://obis.ou.edu/api/obis/acctax/' +
                      this.acode + '/?format=json', 'acctax');
      } else if (this.listResult.type === 'acctax') {
        this.result = (this.listResult) as Acctax;
      }
    } else if (this.listResult.type === 'acctax') {
      this.result = (this.listResult) as Acctax;
    }

    await this.get_swap(this.result);
    await this.get_fed_status(this.result);
    await this.get_st_status(this.result);

    if (this.result.acode !== this.result.elcode) {
      this.response = await this.apiService.get_query('comtax', 'acode', this.acode);

      await this.get_vnames(this.response);

      this.response = await this.apiService.get_query('syntax', 'acode', this.acode);

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
    if (!result.swap) {
      this.swapStatus = 'Not Included';
    } else {
      const baseUrl = result.swap.replace('http', 'https');

      const swapResponse = await this.apiService.get_url_promise(baseUrl + '?format=json', 'swap');

      this.swapStatus = swapResponse.tier;
    }

    this.isSwapLoaded = true;
  }

  async get_fed_status(result: Acctax) {
    if (!result.fed_status) {
      this.fedStatus = 'Not Listed';
    } else {
      const baseUrl = result.fed_status.replace('http', 'https');

      const fedStatusResponse = await this.apiService.get_url_promise(baseUrl + '?format=json', 'fed_status');

      this.fedStatus = fedStatusResponse.description;
    }

    this.isFedStatusLoaded = true;
  }

  async get_st_status(result: Acctax) {
    if (!result.st_status) {
      this.stStatus = 'Not Listed';
    } else {
      const baseUrl = result.st_status.replace('http', 'https');

      const stStatusResponse = await this.apiService.get_url_promise(baseUrl + '?format=json', 'st_status');

      this.stStatus = stStatusResponse.description;
    }

    this.isStStatusLoaded = true;
  }

  async get_vnames(response: ApiResponse) {
    if (response.results.length > 1) {
      for (let r of response.results) {
        r = (r) as Comtax;

        if (r.primary_name) {
          this.primaryVname = r.vernacularname;
        } else {
          this.otherVnames.push(r.vernacularname);
        }
      }
    } else {
      this.primaryVname = response.results[0].vernacularname;
    }

    this.areVNamesLoaded = true;
  }

  async get_synonyms(response: ApiResponse) {
    for (let r of response.results) {
      r = (r) as Syntax;

      this.synonyms.push(r.sname);
    }

    this.areSynsLoaded = true;
  }

  async build_taxa() {
    if (!this.result.taxa) {
      const family = this.result.family;
      const url = 'https://obis.ou.edu/api/obis/hightax/' + family + '/?format=json';

      const response = await this.apiService.get_url_promise(url, 'hightax');

      if (response.kingdom) {
        this.result.taxa = response.kingdom + ' > ' + response.phylum + ' > ' +
                           response.taxclass + ' > ' + response.taxorder + ' > ' + family;
      } else {
        this.result.taxa = 'community';
      }
    }

    if (this.result.taxa === 'community') {
      return;
    }

    const taxaArr = this.result.taxa.split('>');

    for (const str of taxaArr) {
      this.taxa.push(str.trim());
    }

    this.isTaxaBuilt = true;
  }

  async get_occurrences() {
    this.dbService.getOccurrenceData(this.result.sname).subscribe((data: OccurrenceData) => {
      for (const record of data.table) {
        let isDate = true;

        if (record.min_date.toString() === 'No Date Listed') {
          isDate = false;
        }

        const occurrence: Occurrence = {
          county: record.county,
          count: record.count,
          min_date: record.min_date,
          max_date: record.max_date,
          is_date: isDate
        };

        this.occurrences.push(occurrence);
      }
    });
  }

  download(filename: string, text: any) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  export(type: string) {
    const rows = [];

    for (const occurrence of this.occurrences) {
      let row: any = [];
      if (type === 'csv') {
        row = [occurrence.county, occurrence.count, occurrence.min_date, occurrence.max_date].join('","');
      } else if (type === 'pdf') {
        if (occurrence.is_date) {
          row = [
            occurrence.county,
            occurrence.count,
            formatDate(occurrence.min_date, 'longDate', 'en'),
            formatDate(occurrence.max_date, 'longDate', 'en')
          ];
        } else if (!occurrence.is_date) {
          row = [occurrence.county, occurrence.count, 'No Date Listed', 'No Date Listed'];
        }
      }
      rows.push(row);
    }

    if (type === 'csv') {
      const filename = this.result.sname + '.csv';

      rows.unshift('"County","Count","Min Event Date","Max Event Date');
      const csv = rows.join('"\r\n"') + '"';

      this.download(filename, csv);
    } else if (type === 'pdf') {
      const filename = this.result.sname + '.pdf';

      const doc = new jsPDF();
      const col = [['County', 'Count', 'Min Event Date', 'Max Event Date']];

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
