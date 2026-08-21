import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acte } from './acte';

describe('Acte', () => {
  let component: Acte;
  let fixture: ComponentFixture<Acte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acte],
    }).compileComponents();

    fixture = TestBed.createComponent(Acte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
