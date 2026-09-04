import { Component, inject } from '@angular/core';
import { Icon } from '../../icon/icon';
import { ClientToastService } from '../../services/client-toast.service';

@Component({
  selector: 'app-client-toast-container',
  standalone: true,
  imports: [Icon],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
})
export class ClientToastContainer {
  private service = inject(ClientToastService);
  toasts = this.service.toasts;

  iconFor(tone: string): string {
    if (tone === 'success') return 'check-circle';
    if (tone === 'danger') return 'alert-triangle';
    return 'bell';
  }

  dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
