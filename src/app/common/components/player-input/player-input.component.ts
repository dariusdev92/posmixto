import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Player } from '../../models/player.model';
import { nanoid } from 'nanoid';

@Component({
    selector: 'app-player-input',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './player-input.component.html',
    styleUrl: './player-input.component.scss'
})
export class PlayerInputComponent {
    players = model<Player[]>([]);
    playerNameControl = new FormControl('');

    addPlayer() {
        const name = this.playerNameControl.value?.trim();
        if (name) {
            this.players.update(players => [...players, { id: nanoid(), name }]);
            this.playerNameControl.reset();
        }
    }

    removePlayer(id: string) {
        this.players.update(players => players.filter(p => p.id !== id));
    }
}
