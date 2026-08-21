import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentCaMarche } from './comment-ca-marche';

describe('CommentCaMarche', () => {
  let component: CommentCaMarche;
  let fixture: ComponentFixture<CommentCaMarche>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentCaMarche],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentCaMarche);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
