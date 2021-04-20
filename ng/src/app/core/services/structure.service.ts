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

  getRecent(count: number): Observable<Array<StructureCover>> {
    return this.apiService.get(`/structure/recent/${count}`);
  }

  getRandom(count: number): Observable<Array<StructureCover>> {
    return this.apiService.get(`/structure/random/${count}`);
  }

  getRecentTags(count: number): Observable<any> {
    return this.apiService.get(`/tags/recent/${count}`);
  }

  getAutofill(count: number): Observable<any> {
    return this.apiService.get(`/tags/autofill/${count}`);
  }

  search(input: string, category: string): Observable<Array<StructureCover>> {
    return this.apiService.get(`/search/${input}/${category}`);
  }

  get(id: number): Observable<any> {
    return this.apiService.get(`/structure/${id}`);
  }

  checkAuthor(id: number): Observable<any> {
    return this.apiService.get(`/structure/author/${id}`);
  }

  edit(structure: Structure): Observable<any> {
    return this.apiService.post(`/structure/edit`, {structure});
  }

}
