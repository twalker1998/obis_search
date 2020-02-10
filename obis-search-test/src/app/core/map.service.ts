import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private acodeSource: BehaviorSubject<string> = new BehaviorSubject<string>('search');
  acode = this.acodeSource.asObservable();

  constructor() { }

  changeAcode(acode: string) {
    this.acodeSource.next(acode);
  }
}
