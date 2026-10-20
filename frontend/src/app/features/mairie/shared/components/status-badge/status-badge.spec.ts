import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('StatusBadge workflow labels', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatusBadge] });
  });

  it.each([
    ['en_attente', 'En attente'],
    ['valide', 'Validé à l’origine — réception en attente'],
    ['recu', 'Réceptionné'],
    ['en_cours', 'Réception en attente'],
    ['validee', 'Réceptionnée par la mairie de retrait'],
    ['remise', 'Remise au citoyen'],
  ])('maps %s to the explicit workflow label', (statut, label) => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('statut', statut);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe(label);
  });
});
