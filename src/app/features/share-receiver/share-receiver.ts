import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TeamBuilderService } from '../team-builder/services/team-builder';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-share-receiver',
  standalone: true,
  imports: [CommonModule, RouterModule, ...HlmCardImports, ...HlmButtonImports, ...HlmIconImports, NgIconComponent],
  providers: [provideIcons({ lucideArrowLeft, lucideUsers })],
  templateUrl: './share-receiver.html'
})
export class ShareReceiverComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamBuilderService);

  sharedText = signal<string | null>(null);
  sharedTitle = signal<string | null>(null);
  sharedUrl = signal<string | null>(null);
  parseError = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const text = params['text'] || null;
      this.sharedText.set(text);
      this.sharedTitle.set(params['title'] || null);
      this.sharedUrl.set(params['url'] || null);

      if (text) {
        this.processSharedText(text);
      }
    });
  }

  processSharedText(text: string) {
    const players = this.parsePlayersList(text);

    if (players.length >= 2) {
      // Success: Store players and navigate
      this.teamService.setPlayers(players);
      this.router.navigate(['/team-builder']);
    } else {
      // Failure: Could not detect a valid list
      this.parseError.set('No pudimos detectar una lista válida de jugadores (se requieren al menos 2 nombres). Intenta compartir otro mensaje.');
    }
  }

  parsePlayersList(text: string): string[] {
    // Split only by newlines (not commas, since names could have commas)
    const lines = text.split(/\n/);
    const players: string[] = [];

    for (const line of lines) {
      let cleanLine = line.trim();

      // Skip empty lines
      if (!cleanLine) continue;

      // Skip lines that look like date/day headers (e.g. "Martes 10/3", "Lunes 2/5:")
      if (/^\w+\s+\d{1,2}\/\d{1,2}/.test(cleanLine)) continue;

      // Step 1: Remove leading number + separator, including patterns like "1 - ", "2. ", "3) ", "4- "
      cleanLine = cleanLine.replace(/^\d+\s*[-\.\):]\s*/, '').trim();

      // Step 2: Remove any remaining leading bullet/dash/asterisk
      cleanLine = cleanLine.replace(/^[-\*•>]\s*/, '').trim();

      if (cleanLine.length > 1 && cleanLine.length <= 30) {
        players.push(cleanLine);
      }
    }

    return players;
  }
}
