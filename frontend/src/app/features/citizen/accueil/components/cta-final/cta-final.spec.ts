import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaFinal } from './cta-final';

describe('CtaFinal', () => {
  let component: CtaFinal;
  let fixture: ComponentFixture<CtaFinal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaFinal],
    }).compileComponents();

    fixture = TestBed.createComponent(CtaFinal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
