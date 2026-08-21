import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopieActe } from './copie-acte';

describe('CopieActe', () => {
  let component: CopieActe;
  let fixture: ComponentFixture<CopieActe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopieActe],
    }).compileComponents();

    fixture = TestBed.createComponent(CopieActe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
