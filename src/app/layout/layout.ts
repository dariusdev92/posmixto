import { Component, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent, type HeaderAction } from './header';
import { LayoutService } from './layout.service';

export interface LayoutRouteData {
  title: string;
  actions?: HeaderAction[];
  action?: HeaderAction;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  template: `
    <div class="flex flex-col h-[100dvh] bg-background text-foreground">
      <app-header 
        [title]="layoutService.config().title" 
        [actions]="layoutService.config().actions"
        (actionClick)="onActionClick($event)" />
      
      <main class="flex-1 min-h-0 overflow-hidden">
        <router-outlet />
      </main>
    </div>
  `
})
export class LayoutComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  layoutService = inject(LayoutService);

  constructor() {
    // Listen to route data changes
    this.route.data.subscribe(data => {
      const routeData = data as { title?: string; action?: HeaderAction; actions?: HeaderAction[] };
      if (routeData.title) {
        this.layoutService.setConfig({
          title: routeData.title,
          actions: routeData.actions || (routeData.action ? [routeData.action] : [])
        });
      }
    });
  }

  onActionClick(action: HeaderAction) {
    if (action === 'reset') {
      // Navigate with query param to trigger reset
      this.router.navigate([], { 
        queryParams: { action: 'reset' },
        queryParamsHandling: 'merge'
      });
    }
    // Also trigger the signal so features can handle custom actions (like share)
    this.layoutService.triggerActionClick(action);
  }
}
