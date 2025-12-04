import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.toastService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password).toPromise();
      this.toastService.showSuccess('¡Bienvenido!');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Login error:', error);
      this.toastService.showError(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading = false;
    }
  }

  async onGoogleLogin(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.loginWithGoogle().toPromise();
      this.toastService.showSuccess('¡Bienvenido!');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Google login error:', error);
      this.toastService.showError(error.message || 'Error al iniciar sesión con Google');
    } finally {
      this.isLoading = false;
    }
  }
}
