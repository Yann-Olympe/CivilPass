import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CitizenAuthService } from '../../../../../../Servives/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
   auth = inject(CitizenAuthService);

}
