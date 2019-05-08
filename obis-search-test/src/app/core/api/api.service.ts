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

  get_sname(query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + 'acctax/?sname=' + query + '&format=json');
  }

  get_genus(query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + 'acctax/?genus=' + query + '&format=json');
  }

  get_species(query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + 'acctax/?species=' + query + '&format=json');
  }

  get_vname(query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + 'comtax/?vernacularname=' + query + '&format=json');
  }

  get_sname_s(query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + 'syntax/?sname=' + query + '&format=json');
  }
}
