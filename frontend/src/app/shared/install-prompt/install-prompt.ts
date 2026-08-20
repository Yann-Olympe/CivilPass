import { Component, OnInit, signal } from '@angular/core';
import { Icon } from '../../mairies/shared/icon/icon';

interface EvenementInstallationDiffere extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type Plateforme = 'android' | 'ios' | 'desktop';

const CLE_MASQUE = 'civilpass-install-dismiss';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [Icon],
  templateUrl: './install-prompt.html',
  styleUrl: './install-prompt.css'
})
export class InstallPrompt implements OnInit {
  visible = signal(false);
  plateforme = signal<Plateforme>('desktop');
  installationEnCours = signal(false);

  private evenementDiffere: EvenementInstallationDiffere | null = null;

  ngOnInit() {
    if (typeof window === 'undefined') return;
    if (this.estDejaInstalle() || this.estDejaMasque()) return;

    const ua = window.navigator.userAgent;
    const estIOS = /iphone|ipad|ipod/i.test(ua) && !('MSStream' in window);
    const estAndroid = /android/i.test(ua);

    if (estIOS) {
      this.plateforme.set('ios');
      window.setTimeout(() => this.visible.set(true), 2500);
      return;
    }

    this.plateforme.set(estAndroid ? 'android' : 'desktop');

    window.addEventListener('beforeinstallprompt', (evenement: Event) => {
      evenement.preventDefault();
      this.evenementDiffere = evenement as EvenementInstallationDiffere;
      this.visible.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.visible.set(false);
      this.evenementDiffere = null;
    });
  }

  private estDejaInstalle(): boolean {
    const modeStandalone = window.matchMedia?.('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return !!modeStandalone || iosStandalone;
  }

  private estDejaMasque(): boolean {
    try {
      return window.localStorage.getItem(CLE_MASQUE) === '1';
    } catch {
      return false;
    }
  }

  async installer() {
    if (!this.evenementDiffere || this.installationEnCours()) return;

    this.installationEnCours.set(true);
    await this.evenementDiffere.prompt();
    const choix = await this.evenementDiffere.userChoice;
    this.installationEnCours.set(false);
    this.evenementDiffere = null;

    if (choix.outcome === 'accepted') {
      this.visible.set(false);
    } else {
      this.fermer();
    }
  }

  fermer() {
    this.visible.set(false);
    try {
      window.localStorage.setItem(CLE_MASQUE, '1');
    } catch {
      this.visible.set(false);
    }
  }
}
