import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Api_Response } from '../../models/api_response';
import { Acctax } from '../../models/acctax';
import { Hightax } from '../../models/hightax';
import { Swap } from '../../models/swap';
import { FedStatus } from '../../models/fed_status';
import { StateStatus } from '../../models/st_status';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string = "https://obis.ou.edu/api/obis/";

  constructor(private httpClient : HttpClient) { }

  get_url_promise(url: string, type: string) {
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
    }
  }

  get_hightax(url: string) {
    return this.httpClient.get<Hightax>(url).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  get_swap(url: string) {
    return this.httpClient.get<Swap>(url).pipe(
      retry(1),
      catchError(this.handleError)
    ).toPromise();
  }

  get_fedstatus(url: string) {
    return this.httpClient.get<FedStatus>(url).pipe(
      retry(1),
      catchError(this.handleError)
    ).toPromise();
  }

  get_ststatus(url: string) {
    return this.httpClient.get<StateStatus>(url).pipe(
      retry(1),
      catchError(this.handleError)
    ).toPromise();
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
}
