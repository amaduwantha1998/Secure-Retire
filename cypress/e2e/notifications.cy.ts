describe('Notification System', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should display notification bell icon', () => {
    cy.get('[aria-label*="Notifications"]').should('be.visible');
    cy.get('[aria-label*="Notifications"]').find('svg').should('have.class', 'lucide-bell');
  });

  it('should show notification badge when there are unread notifications', () => {
    // Mock notifications in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('notification-storage', JSON.stringify({
        state: {
          notifications: [
            {
              id: '1',
              title: 'Test Notification',
              message: 'This is a test',
              type: 'info',
              read: false,
              created_at: new Date().toISOString()
            }
          ],
          unreadCount: 1
        },
        version: 0
      }));
    });
    
    cy.reload();
    cy.get('[aria-label*="Notifications"]').within(() => {
      cy.get('.bg-destructive').should('be.visible').and('contain', '1');
    });
  });

  it('should toggle notification dropdown on click', () => {
    cy.get('[aria-label*="Notifications"]').click();
    cy.get('[role="button"][aria-label*="Test Notification"]').should('be.visible');
    
    // Click outside to close
    cy.get('body').click(0, 0);
    cy.get('[role="button"][aria-label*="Test Notification"]').should('not.exist');
  });

  it('should support keyboard navigation', () => {
    cy.get('[aria-label*="Notifications"]').focus().type('{enter}');
    cy.get('h3').contains('Notifications').should('be.visible');
    
    cy.get('[aria-label*="Notifications"]').type('{esc}');
    cy.get('h3').contains('Notifications').should('not.exist');
  });

  it('should mark notifications as read', () => {
    // Setup notification
    cy.window().then((win) => {
      win.localStorage.setItem('notification-storage', JSON.stringify({
        state: {
          notifications: [
            {
              id: '1',
              title: 'Test Notification',
              message: 'This is a test',
              type: 'info',
              read: false,
              created_at: new Date().toISOString()
            }
          ],
          unreadCount: 1
        },
        version: 0
      }));
    });
    
    cy.reload();
    cy.get('[aria-label*="Notifications"]').click();
    cy.get('[aria-label="Mark as read"]').click();
    
    // Badge should be gone or show 0
    cy.get('[aria-label*="Notifications"]').within(() => {
      cy.get('.bg-destructive').should('not.exist');
    });
  });

  it('should display notifications on all pages', () => {
    // Test Login page
    cy.visit('/auth');
    cy.get('[aria-label*="Notifications"]').should('be.visible');
    
    // Test Register page
    cy.visit('/register');
    cy.get('[aria-label*="Notifications"]').should('be.visible');
    
    // Test Dashboard (would need auth, so just check if redirects properly)
    cy.visit('/dashboard');
    // Should redirect to auth if not logged in
    cy.url().should('include', '/auth');
  });

  it('should be responsive across different screen sizes', () => {
    // Mobile
    cy.viewport(320, 568);
    cy.get('[aria-label*="Notifications"]').should('be.visible');
    
    // Tablet
    cy.viewport(768, 1024);
    cy.get('[aria-label*="Notifications"]').should('be.visible');
    
    // Desktop
    cy.viewport(1024, 768);
    cy.get('[aria-label*="Notifications"]').should('be.visible');
  });

  it('should maintain accessibility standards', () => {
    cy.get('[aria-label*="Notifications"]').should('have.attr', 'aria-expanded');
    cy.get('[aria-label*="Notifications"]').should('have.attr', 'aria-haspopup', 'true');
    cy.get('[aria-label*="Notifications"]').should('have.attr', 'tabindex', '0');
    
    // Check contrast and focus states
    cy.get('[aria-label*="Notifications"]').focus();
    cy.get('[aria-label*="Notifications"]').should('be.focused');
  });

  it('should work with dark mode', () => {
    // Enable dark mode
    cy.get('[aria-label*="Toggle"]').click();
    cy.get('html').should('have.class', 'dark');
    
    // Notifications should still be visible and functional
    cy.get('[aria-label*="Notifications"]').should('be.visible').click();
    cy.get('h3').contains('Notifications').should('be.visible');
  });
});