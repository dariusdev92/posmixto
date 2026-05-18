import { Injectable, signal, WritableSignal } from '@angular/core';
import { type HeaderAction } from './header';

export interface LayoutConfig {
  title: string;
  actions: HeaderAction[];
}

export interface HeaderActionTrigger {
  action: HeaderAction;
  count: number;
}

// Global signal to track action clicks - features subscribe to this
export const actionClickTrigger: WritableSignal<HeaderActionTrigger> = signal({ action: 'reset', count: 0 });

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
    actionClickTrigger.update(v => ({ action, count: v.count + 1 }));
  }
}
