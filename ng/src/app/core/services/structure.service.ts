import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Structure, StructureCover } from '../models/structure.model';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  constructor(private apiService: ApiService) { }

  // TODO: Add count functionality
  getRecent(count: number): Observable<Array<StructureCover>> {
    return this.apiService.get('/recent_structures');
  }

  search(input: string): Observable<Array<StructureCover>> {
    return this.apiService.get('/search/' + input);
  }

}
