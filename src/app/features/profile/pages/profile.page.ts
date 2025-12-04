import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: User | null = null;
  isLoading = true;

  async ngOnInit(): Promise<void> {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      this.isLoading = false;
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout().toPromise();
    this.router.navigate(['/auth/login']);
  }
}
