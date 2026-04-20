import { Injectable, signal } from '@angular/core';
import { type HeaderAction } from './header';

export interface LayoutConfig {
  title: string;
  action: HeaderAction;
}

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
}