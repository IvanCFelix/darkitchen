import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dishes',
    templateUrl: './dishes.page.html',
    styleUrls: ['./dishes.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, RouterModule]
})
export class DishesPage {
    // Dish management implementation
    isLoading = false;
}
