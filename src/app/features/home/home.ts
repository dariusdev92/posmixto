import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  isStandalone = signal<boolean>(true); // Let's default to true and then correct it, to prevent flicker
  deferredPrompt: any = null;

  ngOnInit() {
    // Detect standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    this.isStandalone.set(isStandaloneMode);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.isStandalone.set(false);
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      alert('Para instalar la aplicación en iOS, pulsa el ícono "Compartir" de Safari y selecciona "Agregar a inicio".');
      return;
    }
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      this.isStandalone.set(true);
    } else {
      console.log('User dismissed the install prompt');
    }
    this.deferredPrompt = null;
  }
}
