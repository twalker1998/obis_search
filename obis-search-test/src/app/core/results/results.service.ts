import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Acctax } from '../../models/acctax';
import { Comtax } from '../../models/comtax';
import { Syntax } from '../../models/syntax';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  public isQueryStarted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isQueryComplete: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  contains(arr: Array<Acctax | Comtax | Syntax>, e: Acctax | Comtax | Syntax): boolean {
    for (let r of arr) {
      if (r.type === 'acctax' || r.type === 'syntax') {
        r =  (r) as Acctax | Syntax;

        if (e.type === 'comtax') {
          continue;
        }

        e =  (e) as Acctax | Syntax;

        if (r.sname === e.sname) {
          return true;
        }
      } else if (r.type === 'comtax') {
        r =  (r) as Comtax;

        if (e.type === 'acctax' || e.type === 'syntax') {
          continue;
        }

        e =  (e) as Comtax;

        if (r.vname === e.vname) {
          return true;
        }
      }
    }

    return false;
  }
}
