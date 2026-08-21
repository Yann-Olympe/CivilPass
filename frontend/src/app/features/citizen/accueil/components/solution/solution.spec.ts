import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Solution } from './solution';

describe('Solution', () => {
  let component: Solution;
  let fixture: ComponentFixture<Solution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solution],
    }).compileComponents();

    fixture = TestBed.createComponent(Solution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
