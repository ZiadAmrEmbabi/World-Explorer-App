import { Pipe, PipeTransform } from '@angular/core';
import { Country } from '../models/model';
import { CountryCode } from '../shared/country-code.enum';  // Import the enum from the shared folder

@Pipe({
  name: 'groupByLetter'
})
export class GroupByLetterPipe implements PipeTransform {
  transform(countries: Country[]): { [key: string]: Country[] } {
    const groupedCountries: { [key: string]: Country[] } = {};

    countries.forEach(country => {
      if (country.iso3 !== CountryCode.ISR) {
        const firstLetter = country.country[0].toUpperCase();
        if (!groupedCountries[firstLetter]) {
          groupedCountries[firstLetter] = [];
        }
        groupedCountries[firstLetter].push(country);
      }
    });

    return groupedCountries;
  }
}
