import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    router = { navigate: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Hero],
      providers: [{ provide: Router, useValue: router }],
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to the guarded request flow and does not advertise unavailable verification', () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-primary').click();

    expect(router.navigate).toHaveBeenCalledWith(['/demande/acte']);
    expect(fixture.nativeElement.textContent).not.toContain('Vérifier un acte');
  });
});
