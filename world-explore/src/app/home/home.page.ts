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
    this.countryService.getCountries().subscribe(response => {
      this.countries = response.data.sort((a, b) => a.country.localeCompare(b.country));
      this.filteredCountries = [...this.countries];
      this.groupCountriesByLetter();
      this.countries.forEach(country => {
        this.countryService.getFlag(country.iso2).subscribe(flagResponse => {
          if (flagResponse.data && flagResponse.data.flag) {
            this.countryFlags[country.country] = flagResponse.data.flag;
          }
        });
      });
    });
  }

  groupCountriesByLetter() {
    this.groupedCountries = {}; // Reset the groupedCountries object
    this.filteredCountries.forEach(country => {
      const firstLetter = country.country[0].toUpperCase();
      if (!this.groupedCountries[firstLetter]) {
        this.groupedCountries[firstLetter] = [];
      }
      this.groupedCountries[firstLetter].push(country);
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

  getKeys(obj: any): string[] {
    return Object.keys(obj).sort();
  }

  filterCountries() {
    if (this.showFavorites) {
      this.filteredCountries = this.countries.filter(country =>
        this.favoriteCountries.has(country.country) &&
        country.country.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredCountries = this.countries.filter(country =>
        country.country.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.groupCountriesByLetter();
  }

  scrollToLetter(letter: string) {
    const target = document.getElementById(`letter-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleSlide(slidingItem: any, event: any, country: Country) {
    const ratio = event.detail.ratio;
    if (ratio > 0.5) { // Swiped to the right
      if (this.showFavorites) {
        this.deleteCountry(country);
      }
      slidingItem.close();
    } else if (ratio < -0.5) { // Swiped to the left
      this.addFavorite(country);
      slidingItem.close();
    }
  }

  addFavorite(country: Country) {
    if (!this.favoriteCountries.has(country.country)) {
      this.favoriteCountries.add(country.country);
    }
    this.filterCountries();
  }

  deleteCountry(country: Country) {
    if (this.showFavorites) {
      this.countries = this.countries.filter(c => c !== country);
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
