import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Probleme } from './probleme';

describe('Probleme', () => {
  let component: Probleme;
  let fixture: ComponentFixture<Probleme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Probleme],
    }).compileComponents();

    fixture = TestBed.createComponent(Probleme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
