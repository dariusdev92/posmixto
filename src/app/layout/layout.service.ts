import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { type HeaderAction } from './header';

export interface LayoutConfig {
  title: string;
  action: HeaderAction;
}

// Global signal to track action clicks - features subscribe to this
export const actionClickTrigger: WritableSignal<number> = signal(0);

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _config = signal<LayoutConfig>({ title: '', action: 'none' });
  
  readonly config = this._config.asReadonly();

  setConfig(config: LayoutConfig) {
    this._config.set(config);
  }
  
  clearConfig() {
    this._config.set({ title: '', action: 'none' });
  }

  // Call this from layout header when action button is clicked
  triggerActionClick() {
    actionClickTrigger.update(v => v + 1);
  }
}