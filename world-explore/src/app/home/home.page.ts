import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Country } from '../models/model';
import { CountryService } from '../services/country.service.service';
import { take } from 'rxjs/operators'; 
import { CountryCode } from '../shared/country-code.enum';  // Import the enum from the shared folder

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  selectedCountryPopulation: { [countryName: string]: number | null } = {};
  countryFlags: { [countryName: string]: string } = {};
  searchTerm: string = '';
  favoriteCountries: Set<string> = new Set();
  showFavorites: boolean = false;

  @ViewChild('content', { static: false }) content!: ElementRef;

  constructor(private countryService: CountryService) {}

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getCountries().pipe(take(1)).subscribe(
      response => this.handleCountryResponse(response),
      error => this.handleError(error)
    );
  }

  handleError(error: any) {
    console.error('Error fetching countries:', error);
  }
  
  handleCountryResponse(response: any) {
    this.countries = Array.isArray(response?.data) ? response.data : [];
    if (this.countries.length) {
      this.filterCountries();
      this.loadCountryFlags();
    } else {
      console.error('Invalid response format:', response);
    }
  }

  loadCountryFlags() {
    this.countries.forEach(country => {
      this.countryService.getFlag(country.iso2).pipe(take(1)).subscribe(flagResponse => {
        this.countryFlags[country.country] = flagResponse?.data?.flag ?? '';
      });
    });
  }
  
  showPopulation(country: Country) {
    if (this.selectedCountryPopulation[country.country] !== undefined) {
      delete this.selectedCountryPopulation[country.country];
    } else {
      this.countryService.getPopulation(country.iso3).pipe(take(1)).subscribe(data => {
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

  filterCountries(event?: any) {
    this.searchTerm = event?.target?.value?.toLowerCase() ?? '';


    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    this.filteredCountries = this.countries.filter(country => {
        const lowerCaseCountryName = country.country.toLowerCase();
        const matchesSearchTerm = lowerCaseCountryName.includes(lowerCaseSearchTerm);
        const isFavorite = this.favoriteCountries.has(country.country);

        return matchesSearchTerm &&
               (!this.showFavorites || isFavorite) &&
               country.iso3 !== CountryCode.ISR;
    });
  }

  scrollToLetter(letter: string) {
    const target = document.getElementById(`letter-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFavorite(country: Country, event: any) {
    if (event.detail.side === 'start' ) {
      this.favoriteCountries.has(country.country)
        ? this.favoriteCountries.delete(country.country)
        : this.favoriteCountries.add(country.country);
      
      this.filterCountries(); 
    }
  }
  

  deleteCountry(country: Country) {
    if (this.showFavorites) {
      this.filteredCountries = this.filteredCountries.filter(c => c !== country);
      this.favoriteCountries.delete(country.country);
    }
  }

  viewFavorites() {
    this.showFavorites = !this.showFavorites;
    this.filterCountries(); // Update the filtered countries list
  }

  getSafeFlagUrl(countryName: string): string | null {
    return this.countryFlags[countryName];
  }
}
