import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideRotateCcw, lucideShare } from '@ng-icons/lucide';

export type HeaderAction = 'none' | 'reset' | 'share';

@Component({
  selector: 'app-header',
  imports: [RouterModule, HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideArrowLeft, lucideRotateCcw, lucideShare })],
  template: `
    <header class="flex items-center p-4 border-b bg-card">
      <a hlmBtn variant="ghost" size="icon" routerLink="/" aria-label="Volver a Inicio">
        <ng-icon name="lucideArrowLeft" />
      </a>
      
      <h1 class="text-xl font-semibold tracking-tight ml-4 flex-1">{{ title() }}</h1>
      
      @if (action() !== 'none') {
        <button 
          hlmBtn 
          variant="ghost" 
          size="icon" 
          (click)="onActionClick()"
          class="text-muted-foreground hover:text-foreground"
          [attr.aria-label]="action() === 'reset' ? 'Reiniciar' : 'Compartir'">
          @if (action() === 'reset') {
            <ng-icon name="lucideRotateCcw" />
          } @else if (action() === 'share') {
            <ng-icon name="lucideShare" />
          }
        </button>
      }
    </header>
  `
})
export class HeaderComponent {
  readonly title = input.required<string>();
  readonly action = input<HeaderAction>('none');
  readonly actionClick = output<void>();

  onActionClick() {
    this.actionClick.emit();
  }
}
