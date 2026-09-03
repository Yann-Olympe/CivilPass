import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientTopbar } from '../client-topbar/client-topbar';
import { ClientSidebar } from '../client-sidebar/client-sidebar';
import { ClientToastContainer } from '../../shared/components/toast/toast-container';

@Component({
  selector: 'app-client-shell',
  standalone: true,
  imports: [RouterOutlet, ClientTopbar, ClientSidebar, ClientToastContainer],
  templateUrl: './client-shell.html',
  styleUrl: './client-shell.css',
})
export class ClientShell {
  // Contrôle l'ouverture du sidebar en version mobile (mode "tiroir").
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
