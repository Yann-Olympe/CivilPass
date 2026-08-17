import { Component, input } from '@angular/core';
import { Icon } from '../../icon/icon';
import { StatCard as StatCardModel } from '../../models/demande.model';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [Icon],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  data = input.required<StatCardModel>();
}
