import { Injectable, signal, WritableSignal } from '@angular/core';
import { type HeaderAction } from './header.component';

// Re-export for convenience
export { type HeaderAction } from './header.component';

export interface LayoutConfig {
  title: string;
  actions: HeaderAction[];
}

// Global signal to track action clicks - features subscribe to this
export const actionClickTrigger = signal<HeaderAction | null>(null);

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _config = signal<LayoutConfig>({ title: '', actions: [] });
  
  readonly config = this._config.asReadonly();

  setConfig(config: LayoutConfig) {
    this._config.set(config);
  }
  
  clearConfig() {
    this._config.set({ title: '', actions: [] });
  }

  // Call this from layout header when action button is clicked
  triggerActionClick(action: HeaderAction) {
    actionClickTrigger.set(action);
  }

  // Reset the trigger - call this when returning to home
  resetActionTrigger() {
    actionClickTrigger.set(null);
  }
}
