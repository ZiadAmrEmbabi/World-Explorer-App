import { Component, OnInit } from '@angular/core';
import { Country } from '../models/model';
import { CountryService } from '../services/country.service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  countries: Country[] | any;
  selectedCountryPopulation: { [country: string]: number | null } = {};



  constructor(private countryService: CountryService) { }

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getCountries().subscribe(data => {
      console.log(data);
      this.countries = data.data;
    });
  }

  showPopulation(country: Country) {
    if (this.selectedCountryPopulation[country.country] !== undefined) {
      // If population is already displayed, hide it
      delete this.selectedCountryPopulation[country.country];
    } else {
      // Fetch and display the population
      this.countryService.getPopulation(country.country).subscribe(data => {
        const population = data.data.populationCounts.pop();
        this.selectedCountryPopulation[country.country] = population.value;
      });
    }
  }
}
