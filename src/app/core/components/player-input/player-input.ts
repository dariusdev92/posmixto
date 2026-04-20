import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Player } from '../../models/player';
import { nanoid } from 'nanoid';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideX } from '@ng-icons/lucide';

@Component({
    selector: 'app-player-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, NgIcon],
    providers: [provideIcons({ lucidePlus, lucideX })],
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
