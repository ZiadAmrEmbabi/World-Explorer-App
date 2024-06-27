import { Pipe, PipeTransform } from '@angular/core';
import { Country } from '../models/model';

@Pipe({
  name: 'sortCountries'
})
export class SortCountriesPipe implements PipeTransform {
  transform(countries: Country[]): Country[] {
    return countries.sort((a, b) => a.country.localeCompare(b.country));
  }
}
