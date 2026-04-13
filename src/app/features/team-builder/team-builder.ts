import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeamBuilderService } from './services/team-builder.service';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePlus, lucideUsers, lucideTrash, lucideShare2, lucideCheck } from '@ng-icons/lucide';

export interface PlayerToken {
  id: string;
  name: string;
  initialX: number;
  initialY: number;
  currentY?: number;
  team: 'A' | 'B';
}

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, RouterModule, ...HlmButtonImports, ...HlmIconImports, ...HlmInputImports, NgIconComponent],
  providers: [provideIcons({ lucideArrowLeft, lucidePlus, lucideUsers, lucideTrash, lucideShare2, lucideCheck })],
  templateUrl: './team-builder.html',
})
export class TeamBuilder implements OnInit {
  private teamService = inject(TeamBuilderService);

  @ViewChild('pitch', { static: true }) pitchRef!: ElementRef<HTMLDivElement>;

  players = signal<PlayerToken[]>([]);
  newPlayerName = signal<string>('');
  copied = signal<boolean>(false);

  exportTeams() {
    const allPlayers = this.players();
    if (allPlayers.length === 0) return;

    // Equipo negro (A) se ordena de arriba hacia abajo (ascendente en Y)
    const negros = allPlayers
      .filter(p => p.team === 'A')
      .sort((a, b) => (a.currentY ?? a.initialY) - (b.currentY ?? b.initialY))
      .map(p => p.name);

    // Equipo blanco (B) se ordena de abajo hacia arriba (descendente en Y)
    const blancos = allPlayers
      .filter(p => p.team === 'B')
      .sort((a, b) => (b.currentY ?? b.initialY) - (a.currentY ?? a.initialY))
      .map(p => p.name);

    let text = '*NEGRO*\n';
    if (negros.length) negros.forEach(p => text += `- ${p}\n`);
    else text += '(vacío)\n';

    text += '\n*BLANCO*\n';
    if (blancos.length) blancos.forEach(p => text += `- ${p}\n`);
    else text += '(vacío)\n';

    if (navigator.share) {
      navigator.share({
        title: 'Equipos',
        text: text
      }).catch(err => {
        // Fallback or user cancelled, try to copy if it failed for not being supported properly
        this.copyToClipboard(text);
      });
    } else {
      this.copyToClipboard(text);
    }
  }

  private copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      }).catch(console.error);
    }
  }

  ngOnInit() {
    const names = this.teamService.getPlayers();
    if (names && names.length > 0) {
      this.setPlayersFromNames(names);
    }
    // If empty, just show the pitch with the add UI (no redirect)
  }

  private setPlayersFromNames(names: string[]) {
    const tokens: PlayerToken[] = names.map((name, index) => {
      const isFirstHalf = index < Math.ceil(names.length / 2);
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 50 + (col * 120);
      const yStrata = isFirstHalf ? 50 : 350;
      const y = yStrata + (row * 80);
      return {
        id: `player-${Date.now()}-${index}`,
        name,
        initialX: x,
        initialY: y,
        currentY: y,
        team: (isFirstHalf ? 'A' : 'B') as 'A' | 'B'
      };
    });
    this.players.set(tokens);
  }

  addPlayer() {
    const name = this.newPlayerName().trim();
    if (!name || name.length > 30) return;

    const current = this.players();
    const index = current.length;
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 50 + (col * 120);
    const y = 350 + (row * 80);

    const newPlayer: PlayerToken = {
      id: `player-${Date.now()}`,
      name,
      initialX: x,
      initialY: y,
      currentY: y,
      team: 'B'
    };

    this.players.set([...current, newPlayer]);
    this.newPlayerName.set('');
  }

  removePlayer(id: string) {
    this.players.set(this.players().filter(p => p.id !== id));
    this.deletingIds.delete(id);
  }

  onAddKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addPlayer();
  }

  // ── Long press to delete ─────────────────────────────────────────────
  private longPressTimers = new Map<string, ReturnType<typeof setTimeout>>();
  deletingIds = new Set<string>(); // players currently counting down

  onLongPressStart(event: PointerEvent, id: string) {
    // Prevent triggering the drag
    event.stopPropagation();
    this.deletingIds.add(id);

    const timer = setTimeout(() => {
      this.removePlayer(id);
    }, 1000);

    this.longPressTimers.set(id, timer);
  }

  onLongPressEnd(id: string) {
    const timer = this.longPressTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.longPressTimers.delete(id);
    }
    this.deletingIds.delete(id);
  }

  onDragEnded(event: CdkDragEnd, player: PlayerToken) {
    // Determine the absolute Y position of the element after dragging
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    const pitchRect = this.pitchRef.nativeElement.getBoundingClientRect();

    // Calculate the Y coordinate relative to the pitch container
    const relativeY = rect.top - pitchRect.top + (rect.height / 2);

    // The pitch midpoint
    const midpointY = pitchRect.height / 2;

    // Mantenemos la posición Y actual en el objeto para el ordenamiento
    player.currentY = relativeY;

    // Update team color based on which half of the pitch the center of the token lands
    const newTeam: 'A' | 'B' = relativeY < midpointY ? 'A' : 'B';

    if (player.team !== newTeam) {
      // Mutate the specific player and update signal
      const updatedPlayers = this.players().map(p => {
        if (p.id === player.id) {
          return { ...p, team: newTeam, currentY: relativeY };
        }
        return p;
      });
      this.players.set(updatedPlayers);
    }
  }
}
