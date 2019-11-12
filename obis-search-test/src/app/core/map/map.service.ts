import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public isResultLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }
}
