import { Component, input } from '@angular/core';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [Icon],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  title = input('Bonjour, Agent');
  subtitle = input("Voici l'état des demandes de votre Mairie.");
  hasNotification = input(true);
}
