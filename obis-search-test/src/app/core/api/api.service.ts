import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Api_Response } from '../../models/api_response';
import { Acctax } from '../../models/acctax';
import { Hightax } from '../../models/hightax';
import { Swap } from '../../models/swap';
import { FedStatus } from '../../models/fed_status';
import { StateStatus } from '../../models/st_status';
import { OccurrenceData } from '../../models/occurrence_data';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string = "https://obis.ou.edu/api/obis/";

  constructor(private httpClient : HttpClient) { }

  get_url(url: string, type: string): any {
    if(type === 'api_response') {
      return this.httpClient.get<Api_Response>(url).pipe(
        retry(1),
        catchError(this.handleError)
      );
    } else if(type === 'acctax') {
      return this.httpClient.get<Acctax>(url).pipe(
        retry(1),
        catchError(this.handleError)
      );
    } else if(type === 'hightax') {
      return this.httpClient.get<Hightax>(url).pipe(
        retry(1),
        catchError(this.handleError)
      );
    } else if(type === 'swap') {
      return this.httpClient.get<Swap>(url).pipe(
        retry(1),
        catchError(this.handleError)
      );
    } else if(type === 'fed_status') {
      return this.httpClient.get<FedStatus>(url).pipe(
        retry(1),
        catchError(this.handleError)
      );
    } else if(type === 'st_status') {
      return this.httpClient.get<StateStatus>(url).pipe(
        retry(1),
        catchError(this.handleError)
      );
    }
  }

  get_url_promise(url: string, type: string): any {
    if(type === 'api_response') {
      return this.httpClient.get<Api_Response>(url).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();
    } else if(type === 'acctax') {
      return this.httpClient.get<Acctax>(url).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();
    } else if(type === 'hightax') {
      return this.httpClient.get<Hightax>(url).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();
    } else if(type === 'swap') {
      return this.httpClient.get<Swap>(url).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();
    } else if(type === 'fed_status') {
      return this.httpClient.get<FedStatus>(url).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();
    } else if(type === 'st_status') {
      return this.httpClient.get<StateStatus>(url).pipe(
        retry(1),
        catchError(this.handleError)
      ).toPromise();
    }
  }

  get_query(table: string, field: string, query: string) {
    return this.httpClient.get<Api_Response>(this.baseUrl + table + '/?' + field + '=' + query + '&format=json').pipe(
      retry(1),
      catchError(this.handleError)
    ).toPromise();
  }

  handleError(error: HttpErrorResponse) {
    if(error.error instanceof ErrorEvent) {
      console.error("An error occurred: ", error.error.message);
      return throwError("Something bad happened, please try again later.");
    } else {
      console.error("Backend returned code " + error.status + ", body was: " + error.error);
      return throwError("Something bad happened, please try again later.");
    }
  }

  get_occurrence_data(sname: string) {
    return this.httpClient.get<OccurrenceData>("http://10.27.0.129/obis_search/occurrence-table.php?sname=" + sname);
  }
}
