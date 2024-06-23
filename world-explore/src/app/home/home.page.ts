import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Country } from '../models/model';
import { CountryService } from '../services/country.service.service';

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
  ngAfterViewInit()
  {
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
    this.countries = this.sortCountries(response.data);
    this.filteredCountries = [...this.countries];
    this.groupCountriesByLetter();
    this.loadCountryFlags();
  }
  sortCountries(countries: Country[]): Country[] {
    return countries.sort((a, b) => a.country.localeCompare(b.country));
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
      country.iso3 !=='ISR' &&  this.groupedCountries[firstLetter].push(country);
      
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
    this.filteredCountries = this.countries.filter(country => 
      country.country.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (!this.showFavorites || this.favoriteCountries.has(country.country))
    );
    this.groupCountriesByLetter();
  }

  scrollToLetter(letter: string) {
    const target = document.getElementById(`letter-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFavorite(country: Country, event: any) {
    if (event.detail.side === "start") {
      if (!this.favoriteCountries.has(country.country)) {
        this.favoriteCountries.add(country.country);
      }
    } else {
      this.deleteCountry(country);
    }
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
