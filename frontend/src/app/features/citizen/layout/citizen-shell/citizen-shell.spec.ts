import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitizenShell } from './citizen-shell';

describe('CitizenShell', () => {
  let component: CitizenShell;
  let fixture: ComponentFixture<CitizenShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitizenShell],
    }).compileComponents();

    fixture = TestBed.createComponent(CitizenShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
