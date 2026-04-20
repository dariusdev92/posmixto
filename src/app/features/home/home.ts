import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Spartan NG & ng-icons imports
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideDices, lucideUsers, lucideDownload, lucideHardDriveDownload } from '@ng-icons/lucide';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HlmCardImports, HlmButtonImports, HlmIconImports, NgIconComponent],
  providers: [provideIcons({ lucideDices, lucideUsers, lucideDownload, lucideHardDriveDownload })],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private router = inject(Router);
  isStandalone = signal<boolean>(true); // Let's default to true and then correct it, to prevent flicker
  deferredPrompt: any = null;

  ngOnInit() {
    // Detect standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    this.isStandalone.set(true);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: Event) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.isStandalone.set(true);
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
  openTeamBuilderDialog() {
    this.router.navigate(['/team-builder']);
  }
}
