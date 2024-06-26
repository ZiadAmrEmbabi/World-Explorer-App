import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Country } from '../models/model';
import { CountryService } from '../services/country.service.service';
import { take } from 'rxjs/operators';
import { CountryCode } from '../shared/country-code.enum';  // Import the enum from the shared folder
import { ToastController } from '@ionic/angular';  // Import ToastController

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  selectedCountryPopulation: { [countryName: string]: number | null } = {};
  searchTerm: string = '';
  favoriteCountries: Set<string> = new Set();
  showFavorites: boolean = false;

  @ViewChild('content', { static: false }) content!: ElementRef;

  constructor(
    private countryService: CountryService,
    private toastController: ToastController  // Inject ToastController
  ) {}

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getCountries().pipe(take(1)).subscribe(
      response => this.handleCountryResponse(response),
      error => this.handleError(error)
    );
  }

  async handleError(error: any) {
    console.error('Error fetching countries:', error);
    const toast = await this.toastController.create({
      message: 'Error fetching countries: ' + error.message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
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
      if (country && country.iso2) {  // Safe check for country and iso2
        this.countryService.getFlag(country.iso2).pipe(take(1)).subscribe(flagResponse => {
          country.flagUrl = flagResponse?.data?.flag ?? '';
        });
      }
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
    event.detail.side === 'start' ? this.favoriteCountries.add(country.country) :
     (this.favoriteCountries.delete(country.country), this.filterCountries());
  }
  

  deleteCountry(country: Country) {
    if (this.showFavorites) {
      this.filteredCountries = this.filteredCountries.filter(c => c !== country);
      this.favoriteCountries.delete(country.country);
    }
  }

  viewFavorites() {
    this.showFavorites = !this.showFavorites;
    this.filterCountries();
  }

  isSafeFlagUrl(url: string): boolean {
    // Implement any additional checks needed
    return url.startsWith('https://');
  }
}
