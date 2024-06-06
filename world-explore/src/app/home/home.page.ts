import { Component, OnInit } from '@angular/core';
import { Country } from '../models/model';
import { CountryService } from '../services/country.service.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  countries: Country[] = [];
  selectedCountryPopulation: { [countryName: string]: number | null } = {};
  countryFlags: { [countryName: string]: string } = {};

  constructor(private countryService: CountryService) {}

  ngOnInit() {
    this.countryService.getCountries().subscribe(response => {
      this.countries = response.data;
      this.countries.forEach(country => {
        this.countryService.getFlag(country.iso2).subscribe(flagResponse => {
          if (flagResponse.data && flagResponse.data.flag) {
            this.countryFlags[country.country] = flagResponse.data.flag;
          }
        });
      });
    });
  }

  showPopulation(country: Country) {
    if (this.selectedCountryPopulation[country.country] !== undefined) {
      delete this.selectedCountryPopulation[country.country];
    } else {
      this.countryService.getPopulation(country.country).subscribe(data => {
        const population = data.data.populationCounts.pop();
        this.selectedCountryPopulation[country.country] = population.value;
      });
    }
  }
}
