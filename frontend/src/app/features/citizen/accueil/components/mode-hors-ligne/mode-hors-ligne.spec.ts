import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeHorsLigne } from './mode-hors-ligne';

describe('ModeHorsLigne', () => {
  let component: ModeHorsLigne;
  let fixture: ComponentFixture<ModeHorsLigne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeHorsLigne],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeHorsLigne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
