import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Player } from '../../models/player.model';
import { nanoid } from 'nanoid';

@Component({
    selector: 'app-player-input',
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule],
    templateUrl: './player-input.component.html'
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
