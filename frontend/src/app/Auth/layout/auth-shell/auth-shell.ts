import { Component, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthStepper } from '../auth-stepper/auth-stepper';
import { Icon } from '../../../Interface/shared/icon/icon';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterOutlet, AuthStepper, Icon],
  templateUrl: './auth-shell.html',
  styleUrl: './auth-shell.css'
})
export class AuthShell implements OnDestroy {
  etapeCourante = signal(1);
  private sub: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.actualiserEtape();
    this.sub = this.router.events
      .pipe(filter((evenement) => evenement instanceof NavigationEnd))
      .subscribe(() => this.actualiserEtape());
  }

  private actualiserEtape() {
    const etape = this.route.snapshot.firstChild?.data?.['etape'] ?? 1;
    this.etapeCourante.set(etape);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
