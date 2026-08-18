import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reseau } from './reseau';

describe('Reseau', () => {
  let component: Reseau;
  let fixture: ComponentFixture<Reseau>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reseau],
    }).compileComponents();

    fixture = TestBed.createComponent(Reseau);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
