import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-skeleton-card',
  template: `
    <ion-card>
      <ion-card-content>
        <ion-skeleton-text [animated]="true" style="width: 60%; height: 20px;"></ion-skeleton-text>
        <ion-skeleton-text [animated]="true" style="width: 100%; height: 14px; margin-top: 12px;"></ion-skeleton-text>
        <ion-skeleton-text [animated]="true" style="width: 80%; height: 14px; margin-top: 8px;"></ion-skeleton-text>
        <ion-skeleton-text [animated]="true" style="width: 40%; height: 32px; margin-top: 16px; border-radius: 8px;"></ion-skeleton-text>
      </ion-card-content>
    </ion-card>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SkeletonCardComponent {}
