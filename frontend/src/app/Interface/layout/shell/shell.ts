import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { ToastContainer } from '../../shared/components/toast/toast-container';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar, ToastContainer],
  templateUrl: './shell.html',
  styleUrl: './shell.css'
})
export class Shell {}
