import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ClientNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class ClientNotificationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/citoyen/notifications`;
  private readonly _notifications = signal<ClientNotification[]>([]);

  readonly notifications = this._notifications.asReadonly();
  readonly nonLues = computed(() => this._notifications().filter((notification) => !notification.lue));

  constructor() {
    this.charger();
  }

  charger(): void {
    this.http.get<ClientNotification[]>(this.baseUrl).pipe(
      tap((notifications) => this._notifications.set(notifications)),
      catchError(() => of([]))
    ).subscribe();
  }

  marquerLue(notification: ClientNotification): void {
    if (notification.lue) return;

    this.http.patch<ClientNotification>(`${this.baseUrl}/${notification.id}/lue`, {}).pipe(
      tap((notificationLue) => {
        this._notifications.update((notifications) => notifications.map((item) =>
          item.id === notificationLue.id ? notificationLue : item
        ));
      }),
      catchError(() => of(null))
    ).subscribe();
  }
}
