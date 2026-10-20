import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CommentCaMarche } from './comment-ca-marche';

describe('CommentCaMarche', () => {
  let component: CommentCaMarche;
  let fixture: ComponentFixture<CommentCaMarche>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentCaMarche],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentCaMarche);
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
