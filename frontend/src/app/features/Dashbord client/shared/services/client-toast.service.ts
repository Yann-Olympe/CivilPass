import { Injectable, signal } from '@angular/core';

export type ClientToastTone = 'success' | 'danger' | 'info';

export interface ClientToastMessage {
  id: number;
  tone: ClientToastTone;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ClientToastService {
  private counter = 0;
  readonly toasts = signal<ClientToastMessage[]>([]);

  show(text: string, tone: ClientToastTone = 'success', durationMs = 3200): void {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, tone, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
