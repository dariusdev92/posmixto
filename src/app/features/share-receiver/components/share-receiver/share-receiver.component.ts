import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TeamBuilderService } from '../../../../core/services/team-builder.service';
import { parsePlayerNames } from '../../../../core/utils/player-list-parser';

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
  templateUrl: './share-receiver.component.html'
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
    const players = parsePlayerNames(text);

    if (players.length >= 2) {
      // Success: Store players and navigate
      this.teamService.setPlayers(players);
      this.router.navigate(['/team-builder']);
    } else {
      // Failure: Could not detect a valid list
      this.parseError.set('No pudimos detectar una lista válida de jugadores (se requieren al menos 2 nombres). Intenta compartir otro mensaje.');
    }
  }

}
