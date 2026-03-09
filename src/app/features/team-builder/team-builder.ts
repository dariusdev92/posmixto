import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { TeamBuilderService } from './services/team-builder.service';

export interface PlayerToken {
  id: string;
  name: string;
  initialX: number;
  initialY: number;
  team: 'A' | 'B'; // A = Top (Black), B = Bottom (White)
}

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './team-builder.html',
})
export class TeamBuilder implements OnInit {
  private teamService = inject(TeamBuilderService);
  private router = inject(Router);

  @ViewChild('pitch', { static: true }) pitchRef!: ElementRef<HTMLDivElement>;

  players = signal<PlayerToken[]>([]);

  constructor() {
    effect(() => {
      console.log(this.players());
    });
  }

  ngOnInit() {
    const names = this.teamService.getPlayers();

    if (!names || names.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    // Initialize players with random positions within their logical half to spread them out
    // and give them an initial team color
    const tokens: PlayerToken[] = names.map((name, index) => {
      const isFirstHalf = index < Math.ceil(names.length / 2);

      // We will place them initially in a grid-like fashion for cleanliness
      const col = index % 3;
      const row = Math.floor(index / 3);

      // X: spread across 3 columns (approx 100px apart, starting at 50px)
      const x = 50 + (col * 120);

      // Y: spread across rows. Max height relies on viewport mostly, 
      // but let's just push team B down by 300px initially
      const yStrata = isFirstHalf ? 50 : 350;
      const y = yStrata + (row * 80);

      return {
        id: `player-${index}`,
        name: name,
        initialX: x,
        initialY: y,
        team: (isFirstHalf ? 'A' : 'B') as 'A' | 'B'
      };
    });

    this.players.set(tokens);
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

    // Update team color based on which half of the pitch the center of the token lands
    const newTeam: 'A' | 'B' = relativeY < midpointY ? 'A' : 'B';

    if (player.team !== newTeam) {
      // Mutate the specific player and update signal
      const updatedPlayers = this.players().map(p => {
        if (p.id === player.id) {
          return { ...p, team: newTeam };
        }
        return p;
      });
      this.players.set(updatedPlayers);
    }
  }
}
