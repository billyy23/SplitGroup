import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  errorMsg = signal('');
  loading = signal(false);
  modoRegistro = signal(false);

  async submit() {
    this.errorMsg.set('');
    this.loading.set(true);

    try {
      if (this.modoRegistro()) {
        await this.authService.register(this.email(), this.password());
      } else {
        await this.authService.login(this.email(), this.password());
      }
      this.router.navigate(['/grupos']);
    } catch (error: any) {
      this.errorMsg.set(this.traducirError(error.code));
    } finally {
      this.loading.set(false);
    }
  }

  toggleModo() {
    this.modoRegistro.update(v => !v);
    this.errorMsg.set('');
  }

  private traducirError(code: string): string {
    const errores: Record<string, string> = {
      'auth/invalid-email': 'El correo no es válido.',
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/email-already-in-use': 'Ese correo ya está registrado.',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-credential': 'Credenciales incorrectas. Revisa tu correo y contraseña.',
    };
    return errores[code] ?? 'Ha ocurrido un error. Inténtalo de nuevo.';
  }

}

