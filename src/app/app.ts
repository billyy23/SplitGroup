import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, RouterLink],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SplitGroup');
  protected router = inject(Router);
  private authService = inject(AuthService);

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
