import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { SortCountriesPipe } from '../pipes/sort-countries.pipe';
import { GroupByLetterPipe } from '../pipes/groupByLetter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    SortCountriesPipe,
    GroupByLetterPipe
  ]
})
export class HomePageModule {}
