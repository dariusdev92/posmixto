import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TeamBuilderService } from '../team-builder/services/team-builder.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private dialog = inject(MatDialog);
  private teamService = inject(TeamBuilderService);
  private router = inject(Router);
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
  openTeamBuilderDialog() {
    const playerText = prompt('Pegá o escribí la lista de jugadores (uno por línea):');
    if (!playerText) return;

    const lines = playerText.split(/\n/);
    const players: string[] = [];
    for (const line of lines) {
      let clean = line.trim();
      if (!clean) continue;
      // Skip date/header lines like "Martes 10/3"
      if (/^\w+\s+\d{1,2}\/\d{1,2}/.test(clean)) continue;
      // Strip leading number + separator (e.g. "1 - ", "2.", "4- ")
      clean = clean.replace(/^\d+\s*[-\.\)]\s*/, '').trim();
      // Strip remaining leading bullet/dash
      clean = clean.replace(/^[-\*•]\s*/, '').trim();
      // Strip trailing bullets (e.g. "Baca •")
      clean = clean.replace(/\s*[•\*]+\s*$/, '').trim();
      if (clean.length > 1 && clean.length <= 30) players.push(clean);
    }

    if (players.length < 2) {
      alert('No se encontraron suficientes jugadores. Ingresá al menos 2 nombres.');
      return;
    }

    this.teamService.setPlayers(players);
    this.router.navigate(['/team-builder']);
  }
}
