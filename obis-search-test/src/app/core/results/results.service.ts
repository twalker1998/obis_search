import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  public isQueryStarted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isQueryComplete: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  constructor() { }
}
