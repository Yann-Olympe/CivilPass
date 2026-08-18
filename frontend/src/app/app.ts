import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallPrompt } from './shared/install-prompt/install-prompt';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InstallPrompt],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
