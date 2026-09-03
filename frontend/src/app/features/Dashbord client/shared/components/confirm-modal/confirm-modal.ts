import { Component, input, output } from '@angular/core';
import { Icon } from '../../icon/icon';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [Icon],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input('Confirmer');
  cancelLabel = input('Annuler');
  tone = input<'primary' | 'danger'>('primary');

  confirmed = output<void>();
  cancelled = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancelled.emit();
    }
  }
}
