import { Component } from '@angular/core';

import { SearchService } from '../../core/search/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  constructor(private searchService: SearchService) { }

  search(query: string): void {
    this.searchService.query_api(query);
  }
}
