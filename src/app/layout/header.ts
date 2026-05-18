import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideRotateCcw, lucideShare, lucideUndo2 } from '@ng-icons/lucide';

export type HeaderAction = 'reset' | 'share' | 'undo';

@Component({
  selector: 'app-header',
  imports: [RouterModule, HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideArrowLeft, lucideRotateCcw, lucideShare, lucideUndo2 })],
  template: `
    <header class="flex items-center p-4 border-b bg-card">
      <a hlmBtn variant="ghost" size="icon" routerLink="/" aria-label="Volver a Inicio">
        <ng-icon name="lucideArrowLeft" />
      </a>
      
      <h1 class="text-xl font-semibold tracking-tight ml-4 flex-1">{{ title() }}</h1>
      
      <div class="flex items-center gap-1">
        @for (headerAction of actions(); track headerAction) {
          <button 
            hlmBtn 
            variant="ghost" 
            size="icon" 
            (click)="onActionClick(headerAction)"
            class="text-muted-foreground hover:text-foreground"
            [attr.aria-label]="getActionLabel(headerAction)">
            @if (headerAction === 'reset') {
              <ng-icon name="lucideRotateCcw" />
            } @else if (headerAction === 'share') {
              <ng-icon name="lucideShare" />
            } @else if (headerAction === 'undo') {
              <ng-icon name="lucideUndo2" />
            }
          </button>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly title = input.required<string>();
  readonly actions = input<HeaderAction[]>([]);
  readonly actionClick = output<HeaderAction>();

  onActionClick(action: HeaderAction) {
    this.actionClick.emit(action);
  }

  getActionLabel(action: HeaderAction): string {
    if (action === 'reset') {
      return 'Reiniciar';
    }

    if (action === 'share') {
      return 'Compartir';
    }

    return 'Deshacer';
  }
}
