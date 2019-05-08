import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Api_Response } from '../../models/api_response';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string = "https://obis.ou.edu/api/obis/";

  constructor(private httpClient : HttpClient) { }

  get_url(url: string) {
    return this.httpClient.get<Api_Response>(url);
  }

  get_query(table: string, field: string, query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + table + '/?' + field + '=' + query + '&format=json');
  }
}
