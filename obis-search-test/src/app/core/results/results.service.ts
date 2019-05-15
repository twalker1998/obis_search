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
    for(let r of arr) {
      if(r.type === 'acctax' || r.type === 'syntax') {
        r = <Acctax | Syntax>(r);

        if(e.type === 'comtax') {
          continue;
        }

        e = <Acctax | Syntax>(e);

        if(r.sname === e.sname) {
          return true;
        }
      } else if(r.type === 'comtax') {
        r = <Comtax>(r);

        if(r.type === 'acctax' || r.type === 'syntax') {
          continue;
        }

        e = <Comtax>(e);

        if(r.vname === e.vname) {
          return true;
        }
      }
    }

    return false;
  }
}
