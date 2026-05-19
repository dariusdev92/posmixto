import { Component, ElementRef, inject, OnInit, signal, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { TeamBuilderService } from '../../../../core/services/team-builder.service';
import { actionClickTrigger, LayoutService } from '../../../../layout/layout.service';
import { parsePlayerNames } from '../../../../core/utils/player-list-parser';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideUsers, lucideTrash, lucideShare2, lucideCheck, lucideClipboard } from '@ng-icons/lucide';

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
  imports: [CommonModule, DragDropModule, FormsModule, ...HlmButtonImports, ...HlmIconImports, ...HlmInputImports, NgIconComponent],
  providers: [provideIcons({ lucidePlus, lucideUsers, lucideTrash, lucideShare2, lucideCheck, lucideClipboard })],
  templateUrl: './team-builder.component.html',
})
export class TeamBuilder implements OnInit {
  private teamService = inject(TeamBuilderService);
  private layoutService = inject(LayoutService);

  @ViewChild('pitch', { static: true }) pitchRef!: ElementRef<HTMLDivElement>;

  players = signal<PlayerToken[]>([]);
  newPlayerName = signal<string>('');
  copied = signal<boolean>(false);
  inputFeedback = signal<string | null>(null);

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

constructor() {
    // Track action clicks from layout header
    effect(() => {
      const action = actionClickTrigger();
      if (action === 'share') {
        this.exportTeams();
        this.layoutService.resetActionTrigger();
      }
    });
  }

  ngOnInit() {
    const names = this.teamService.getPlayers();
    if (names && names.length > 0) {
      this.setPlayersFromNames(names);
    }
  }

  private setPlayersFromNames(names: string[]) {
    const tokens = this.buildDistributedTokens(names);
    this.players.set(tokens);
  }

  addPlayer() {
    this.processPlayerInput(this.newPlayerName());
  }

  async pasteFromClipboard() {
    if (!navigator.clipboard?.readText) {
      this.inputFeedback.set('Tu navegador no permite leer el portapapeles desde acá.');
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      this.newPlayerName.set(text);
      this.processPlayerInput(text);
    } catch {
      this.inputFeedback.set('No pudimos leer el portapapeles. Probá pegar manualmente en el input.');
    }
  }

  onPaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text')?.trim();
    if (!text) return;

    event.preventDefault();
    this.newPlayerName.set(text);
    this.processPlayerInput(text);
  }

  removePlayer(id: string) {
    this.players.set(this.players().filter(p => p.id !== id));
    this.deletingIds.delete(id);
  }

  onAddKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addPlayer();
  }

  private processPlayerInput(rawText: string) {
    const text = rawText.trim();

    if (!text) {
      this.inputFeedback.set(null);
      return;
    }

    const parsedNames = parsePlayerNames(text);

    if (parsedNames.length === 0) {
      this.inputFeedback.set('No detectamos jugadores válidos en ese texto.');
      return;
    }

    const addedCount = this.addPlayersByName(parsedNames);

    if (addedCount === 0) {
      this.inputFeedback.set('Esos jugadores ya estaban cargados.');
      return;
    }

    this.newPlayerName.set('');
    this.inputFeedback.set(addedCount === 1 ? 'Se agregó 1 jugador.' : `Se agregaron ${addedCount} jugadores.`);
  }

  private addPlayersByName(names: string[]): number {
    const current = this.players();
    const existingNames = new Set(current.map(player => player.name.trim().toLowerCase()));
    const uniqueIncomingNames = names.filter(name => {
      const normalizedName = name.trim().toLowerCase();
      if (existingNames.has(normalizedName)) {
        return false;
      }

      existingNames.add(normalizedName);
      return true;
    });

    if (uniqueIncomingNames.length === 0) {
      return 0;
    }

    const newPlayers = uniqueIncomingNames.length === 1
      ? [this.buildManualPlayerToken(uniqueIncomingNames[0])]
      : this.buildDistributedTokens(uniqueIncomingNames, current);

    this.players.set([...current, ...newPlayers]);
    return newPlayers.length;
  }

  private buildDistributedTokens(names: string[], existingPlayers: PlayerToken[] = []): PlayerToken[] {
    const teamACount = existingPlayers.filter(player => player.team === 'A').length;
    const teamBCount = existingPlayers.filter(player => player.team === 'B').length;
    const teamAPlayers = names.slice(0, Math.ceil(names.length / 2));
    const teamBPlayers = names.slice(Math.ceil(names.length / 2));

    return [
      ...teamAPlayers.map((name, index) => this.buildPlayerToken(name, 'A', teamACount + index)),
      ...teamBPlayers.map((name, index) => this.buildPlayerToken(name, 'B', teamBCount + index)),
    ];
  }

  private buildManualPlayerToken(name: string): PlayerToken {
    const teamBCount = this.players().filter(player => player.team === 'B').length;
    return this.buildPlayerToken(name, 'B', teamBCount);
  }

  private buildPlayerToken(name: string, team: 'A' | 'B', teamIndex: number): PlayerToken {
    const col = teamIndex % 3;
    const row = Math.floor(teamIndex / 3);
    const x = 50 + (col * 120);
    const yBase = team === 'A' ? 50 : 350;
    const y = yBase + (row * 80);

    return {
      id: `player-${Date.now()}-${team}-${teamIndex}`,
      name,
      initialX: x,
      initialY: y,
      currentY: y,
      team
    };
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
