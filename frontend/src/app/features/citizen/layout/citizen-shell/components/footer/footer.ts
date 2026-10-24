import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitizenAuthService } from '../../../../../../Services/citizen-auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  auth = inject(CitizenAuthService);
  currentYear = new Date().getFullYear();
}