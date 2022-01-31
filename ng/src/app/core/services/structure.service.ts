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

  getNext(id: any): Observable<Array<StructureCover>> {
    return this.apiService.get(`/structure/next/${id}`);
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

  get(id: any): Observable<any> {    
    return this.apiService.get(`/structure/${id}`);
  }

  checkAuthor(id: any): Observable<any> {
    return this.apiService.get(`/structure/author/${id}`);
  }

  checkAdmin(): Observable<any> {
    return this.apiService.get(`/isAdmin`);
  }

  edit(structure: Structure): Observable<any> {
    return this.apiService.post(`/structure/edit`, {structure});
  }

  delete(id: String): Observable<any> {
    return this.apiService.post(`/structure/delete`, {id});
  }

  togglePrivate(structure: Structure): Observable<any> {
    return this.apiService.post(`/structure/togglePrivate`, {structure});
  }

  getPublication(doi: string): Observable<any> {
    return this.apiService.post(`/publication`, {doi});
  }

}
