import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink]
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  registerForm: FormGroup;
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.toastService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.toastService.showError('Las contraseñas no coinciden');
      return;
    }

    this.isLoading = true;
    const { email, displayName } = this.registerForm.value;

    try {
      await this.authService.register(email, password, displayName).toPromise();
      this.toastService.showSuccess('¡Registro exitoso! Bienvenido');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Register error:', error);
      this.toastService.showError(error.message || 'Error al registrarse');
    } finally {
      this.isLoading = false;
    }
  }
}
