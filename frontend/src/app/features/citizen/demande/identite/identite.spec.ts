import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Identite } from './identite';

describe('Identite', () => {
  let component: Identite;
  let fixture: ComponentFixture<Identite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Identite],
    }).compileComponents();

    fixture = TestBed.createComponent(Identite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
