import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AgentAuthService } from '../../../../Services/agent-auth.service';
import { Sidebar } from './sidebar';

describe('Sidebar mairie profile', () => {
  it('shows the authenticated agent mairie instead of a fixed mairie name', () => {
    TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        {
          provide: AgentAuthService,
          useValue: {
            profile: signal({
              id: 3,
              nom: 'Maroua 1er',
              email: 'maroua1@gmail.com',
              role: 'les_deux',
              mairie_id: 3,
              mairie: {
                id: 3,
                nom: 'Mairie de Maroua Ier',
                ville: 'Maroua',
              },
            }),
            logout: vi.fn(),
          },
        },
        provideRouter([]),
      ],
    });

    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sidebar__profile-name').textContent.trim())
      .toBe('Mairie de Maroua Ier');
    expect(fixture.nativeElement.textContent).not.toContain('Mairie de Yaoundé I');
  });
});
