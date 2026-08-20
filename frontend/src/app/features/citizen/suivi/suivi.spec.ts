import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Suivi } from './suivi';

describe('Suivi', () => {
  let component: Suivi;
  let fixture: ComponentFixture<Suivi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suivi],
    }).compileComponents();

    fixture = TestBed.createComponent(Suivi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
