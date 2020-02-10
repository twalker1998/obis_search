import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { OccurrenceData } from '../models/occurrence-data';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  baseUrl = 'http://obsvweb1.ou.edu/obis_db_scripts/';

  constructor(private httpClient: HttpClient) { }

  getOccurrenceData(sname: string) {
    return this.httpClient.get<OccurrenceData>(this.baseUrl + 'occurrence-table.php?sname=' + sname);
  }
}
