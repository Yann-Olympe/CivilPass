import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CtaFinal } from './cta-final';

describe('CtaFinal', () => {
  let component: CtaFinal;
  let fixture: ComponentFixture<CtaFinal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaFinal],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CtaFinal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to the existing guarded request route', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.btn-primary').getAttribute('href'))
      .toBe('/demande/acte');
  });
});
