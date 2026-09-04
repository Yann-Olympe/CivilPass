import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Icon } from '../../icon/icon';
import { ClientSupportService } from '../../services/client-support.service';
import { ClientToastService } from '../../services/client-toast.service';

@Component({
  selector: 'app-support-modal',
  standalone: true,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './support-modal.html',
  styleUrl: './support-modal.css',
})
export class SupportModal {
  private fb = inject(FormBuilder);
  private support = inject(ClientSupportService);
  private toast = inject(ClientToastService);

  closed = output<void>();

  sending = this.support.sending;

  form = this.fb.nonNullable.group({
    sujet: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.support.envoyer(this.form.getRawValue()).subscribe(() => {
      this.toast.show('Votre message a été envoyé. Notre équipe vous répondra sous 24h.', 'success');
      this.form.reset();
      this.close();
    });
  }
}
