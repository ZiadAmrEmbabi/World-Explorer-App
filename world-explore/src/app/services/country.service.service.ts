import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private http: HttpClient) { }

  getCountries(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.apiUrl);
  }

  getPopulation(iso3: string): Observable<any> {
    const populationUrl = `${this.apiUrl}/population`;
    return this.http.post(populationUrl, { iso3 });
  }

  getFlag(iso2: string): Observable<any> {
    const flagUrl = `${this.apiUrl}/flag/images`;
    return this.http.post(flagUrl, { iso2 });
  }
}
