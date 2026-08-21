import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mairie } from './mairie';

describe('Mairie', () => {
  let component: Mairie;
  let fixture: ComponentFixture<Mairie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mairie],
    }).compileComponents();

    fixture = TestBed.createComponent(Mairie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
