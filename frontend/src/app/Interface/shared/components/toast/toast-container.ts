import { Component, inject } from '@angular/core';
import { Icon } from '../../icon/icon';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [Icon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ToastContainer {
  private service = inject(ToastService);
  toasts = this.service.toasts;

  iconFor(tone: string) {
    if (tone === 'success') return 'check';
    if (tone === 'danger') return 'x';
    return 'badge';
  }

  dismiss(id: number) {
    this.service.dismiss(id);
  }
}
