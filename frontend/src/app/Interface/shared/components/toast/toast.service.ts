import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'danger' | 'info';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(text: string, tone: ToastTone = 'success', durationMs = 3200) {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, tone, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
