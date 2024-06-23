import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Country } from '../models/model';
import { CountryService } from '../services/country.service.service';

enum CountryCode {
  ISR = 'ISR'
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  groupedCountries: { [key: string]: Country[] } = {};
  selectedCountryPopulation: { [countryName: string]: number | null } = {};
  countryFlags: { [countryName: string]: string } = {};
  searchTerm: string = '';
  favoriteCountries: Set<string> = new Set();
  showFavorites: boolean = false;

  @ViewChild('content', { static: false }) content!: ElementRef;

  constructor(private countryService: CountryService) {}

  ngOnInit() {
  }
  
  ngAfterViewInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getCountries().subscribe(
      response => this.handleCountryResponse(response),
      error => this.handleError(error)
    );
  }

  handleError(error: any) {
    console.error('Error fetching countries:', error);
  }

  handleCountryResponse(response: any) {
    if (response && response.data && Array.isArray(response.data)) {
      this.countries = response.data;
      this.filteredCountries = [...this.countries];
      this.groupCountriesByLetter();
      this.loadCountryFlags();
    } else {
      console.error('Invalid response format:', response);
    }
  }
  

  loadCountryFlags() {
    this.countries.forEach(country => {
      this.countryService.getFlag(country.iso2).subscribe(flagResponse => {
        if (flagResponse.data && flagResponse.data.flag) {
          this.countryFlags[country.country] = flagResponse.data.flag;
        }
      });
    });
  }

  groupCountriesByLetter() {
    this.groupedCountries = {};
    this.filteredCountries.forEach(country => {
      const firstLetter = country.country[0].toUpperCase();
      if (!this.groupedCountries[firstLetter]) {
        this.groupedCountries[firstLetter] = [];
      }
      country.iso3 !== CountryCode.ISR && this.groupedCountries[firstLetter].push(country);
    });
  }

  showPopulation(country: Country) {
    if (this.selectedCountryPopulation[country.country] !== undefined) {
      delete this.selectedCountryPopulation[country.country];
    } else {
      this.countryService.getPopulation(country.iso3).subscribe(data => {
        const population = data?.data?.populationCounts?.at(-1);
        if (population) {
          this.selectedCountryPopulation[country.country] = population.value;
        }
      });
    }
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj).sort();
  }

  filterCountries() {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    this.filteredCountries = this.countries.filter(country => {
      const lowerCaseCountryName = country.country.toLowerCase();
      return lowerCaseCountryName.includes(lowerCaseSearchTerm) &&
             (!this.showFavorites || this.favoriteCountries.has(country.country));
    });

    this.groupCountriesByLetter();
  }

  scrollToLetter(letter: string) {
    const target = document.getElementById(`letter-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFavorite(country: Country, event: any) {
    const isStartSwipe = event.detail.side === "start";
    const isNotFavorite = !this.favoriteCountries.has(country.country);
    isStartSwipe && isNotFavorite ? this.favoriteCountries.add(country.country) : this.deleteCountry(country);
    this.filterCountries();
  }

  deleteCountry(country: Country) {
    if (this.showFavorites) {
      this.filteredCountries = this.filteredCountries.filter(c => c !== country);
      this.favoriteCountries.delete(country.country);
      this.groupCountriesByLetter();
    }
  }

  viewFavorites() {
    this.showFavorites = !this.showFavorites;
    this.filterCountries();
  }
}
