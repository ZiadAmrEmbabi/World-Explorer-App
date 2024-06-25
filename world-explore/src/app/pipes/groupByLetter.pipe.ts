import { Pipe, PipeTransform } from '@angular/core';
import { Country } from '../models/model';
import { CountryCode } from '../shared/country-code.enum';  // Import the enum from the shared folder

@Pipe({
  name: 'groupByLetter'
})
export class GroupByLetterPipe implements PipeTransform {
  transform(countries: Country[]): { [key: string]: Country[] } {
    return countries
      .filter(country => country.iso3 !== CountryCode.ISR)
      .reduce((groupedCountries, country) => {
        const firstLetter = country.country[0].toUpperCase();
        groupedCountries[firstLetter] = [...(groupedCountries[firstLetter] || []), country];
        return groupedCountries;
      }, {} as { [key: string]: Country[] });
  }
  
}
