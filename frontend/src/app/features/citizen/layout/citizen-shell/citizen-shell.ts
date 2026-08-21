import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-citizen-shell',
  imports: [RouterOutlet,Header,Footer],
  templateUrl: './citizen-shell.html',
  styleUrl: './citizen-shell.css',
})
export class CitizenShell {}
