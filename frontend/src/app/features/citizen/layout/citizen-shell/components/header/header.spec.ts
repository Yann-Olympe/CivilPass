import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CitizenAuthService } from '../../../../../../Services/citizen-auth.service';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: CitizenAuthService, useValue: { estConnecte: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the project logo asset beside the CivilPass name', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.header__logo img').getAttribute('src'))
      .toBe('/assets/logo.png');
    expect(fixture.nativeElement.querySelector('.header__logo').textContent).toContain('CivilPass');
  });

  it('navigates section links to the corresponding accueil anchor', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href="/accueil#probleme"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/accueil#comment-ca-marche"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/accueil#reseau"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/accueil#hors-ligne"]')).toBeTruthy();
  });
});
