import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-palitos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative transition-all duration-100" [ngClass]="sizeClass">
      <div class="absolute left-0 top-0 h-full w-2 rounded-full transition-colors duration-200" [ngClass]="count >= 1 ? activeClass : inactiveClass"></div>
      <div class="absolute left-0 top-0 h-2 w-full rounded-full transition-colors duration-200" [ngClass]="count >= 2 ? activeClass : inactiveClass"></div>
      <div class="absolute right-0 top-0 h-full w-2 rounded-full transition-colors duration-200" [ngClass]="count >= 3 ? activeClass : inactiveClass"></div>
      <div class="absolute bottom-0 left-0 h-2 w-full rounded-full transition-colors duration-200" [ngClass]="count >= 4 ? activeClass : inactiveClass"></div>
      <div class="absolute left-1/2 top-1/2 h-2 w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full origin-center transition-colors duration-200" [ngClass]="count >= 5 ? activeClass : inactiveClass"></div>
    </div>
  `
})
export class PalitosComponent {
  @Input() count!: number;
  @Input() activeClass = 'bg-zinc-300';
  @Input() inactiveClass = 'bg-transparent';
  @Input() sizeClass = 'h-16 w-16';
}
