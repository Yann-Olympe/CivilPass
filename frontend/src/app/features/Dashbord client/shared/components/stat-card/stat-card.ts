import { Component, input, output } from '@angular/core';
import { Icon } from '../../icon/icon';

export interface ClientStatCardData {
  label: string;
  value: string;
  icon: string;
  tone: 'green' | 'yellow' | 'blue' | 'gray';
  footer: string;
}

@Component({
  selector: 'app-client-stat-card',
  standalone: true,
  imports: [Icon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class ClientStatCard {
  data = input.required<ClientStatCardData>();
  /** Si vrai, la carte se comporte comme un bouton (survol + focus + clic). */
  clickable = input(true);

  activated = output<void>();

  onActivate(): void {
    if (this.clickable()) {
      this.activated.emit();
    }
  }
}
