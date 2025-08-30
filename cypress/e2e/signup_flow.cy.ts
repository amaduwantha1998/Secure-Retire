import { describe, it, expect, beforeEach } from 'cypress'

describe('Sign-Up Flow Tests', () => {
  beforeEach(() => {
    cy.visit('/signup')
  })

  it('should display signup form correctly', () => {
    cy.get('[data-testid="auth-form-container"]').should('be.visible')
    cy.get('h1').should('contain', 'Create Account')
    
    // Check form fields
    cy.get('#fullName').should('be.visible')
    cy.get('#email').should('be.visible')
    cy.get('#phone').should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('#confirmPassword').should('be.visible')
    
    // Check submit button
    cy.get('button[aria-label="Create account"]').should('be.visible').and('contain', 'Register')
  })

  it('should validate form fields before submission', () => {
    cy.get('button[aria-label="Create account"]').click()
    
    // Should show validation error
    cy.get('.alert-destructive').should('be.visible')
  })

  it('should redirect directly to registration form after successful signup', () => {
    // Fill out signup form
    cy.get('#fullName').type('Test User')
    cy.get('#email').type(`test${Date.now()}@example.com`)
    cy.get('#phone').type('+1234567890')
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    // Submit form
    cy.get('button[aria-label="Create account"]').click()
    
    // Should redirect to registration form immediately without delay
    cy.url({ timeout: 8000 }).should('include', '/register')
    cy.get('h1', { timeout: 8000 }).should('contain', 'Complete Your Profile')
    
    // Should be on step 1
    cy.get('.text-sm.font-medium').should('contain', 'Personal Information')
    
    // Verify no redirect to dashboard occurred
    cy.url().should('not.include', '/dashboard')
  })

  it('should handle network errors gracefully', () => {
    // Intercept signup request and return error
    cy.intercept('POST', '**/auth/v1/signup', {
      statusCode: 500,
      body: { error: 'Network error' }
    }).as('signupError')
    
    // Fill and submit form
    cy.get('#fullName').type('Test User')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    cy.get('button[aria-label="Create account"]').click()
    
    // Should show error message
    cy.get('.alert-destructive').should('be.visible')
    cy.get('.alert-destructive').should('contain', 'Network error')
  })

  it('should show loading state during signup', () => {
    // Intercept and delay signup request
    cy.intercept('POST', '**/auth/v1/signup', {
      delay: 2000,
      statusCode: 200,
      body: { user: { id: '123' }, session: { access_token: 'token' } }
    }).as('signupRequest')
    
    // Fill and submit form
    cy.get('#fullName').type('Test User')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    cy.get('button[aria-label="Create account"]').click()
    
    // Should show loading spinner
    cy.get('button[aria-label="Create account"]').should('be.disabled')
    cy.get('.animate-spin').should('be.visible')
  })

  it('should navigate to login page via link', () => {
    cy.get('a[href="/login"]').click()
    cy.url().should('include', '/login')
    cy.get('h1').should('contain', 'Welcome Back')
  })

  it('should maintain theme toggle functionality', () => {
    cy.get('[data-testid="theme-toggle"]').should('be.visible')
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('html').should('have.class', 'dark')
  })

  it('should handle accessibility requirements', () => {
    // Check ARIA labels
    cy.get('button[aria-label="Create account"]').should('exist')
    cy.get('button[aria-label="Show password"]').should('exist')
    
    // Check form labels
    cy.get('label[for="fullName"]').should('be.visible')
    cy.get('label[for="email"]').should('be.visible')
    cy.get('label[for="password"]').should('be.visible')
    
    // Check keyboard navigation
    cy.get('#fullName').focus().tab().should('have.attr', 'id', 'email')
  })
})

describe('Registration Form Flow', () => {
  beforeEach(() => {
    // Mock authenticated state
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: { id: 'test-user-id', email: 'test@example.com' }
        }
      }))
    })
    
    cy.visit('/register')
  })

  it('should display registration steps correctly', () => {
    cy.get('h1').should('contain', 'Complete Your Profile')
    
    // Check progress steps
    cy.get('.flex.items-center.justify-between').should('be.visible')
    cy.get('.text-sm.font-medium').should('contain', 'Personal Information')
  })

  it('should navigate through all steps to dashboard completion', () => {
    // Step 1: Personal Information
    cy.get('input[placeholder*="Full name"]').type('John Doe')
    cy.get('input[type="date"]').type('1985-05-15')
    cy.get('input[placeholder*="Street address"]').type('123 Main St')
    cy.get('input[placeholder*="City"]').type('Anytown')
    cy.get('select').first().select('CA')
    cy.get('input[placeholder*="ZIP"]').type('12345')
    cy.get('input[placeholder*="phone"]').type('+1234567890')
    
    cy.get('button').contains('Next').click()
    
    // Step 2: Financial Details (optional)
    cy.get('button').contains('Next').click()
    
    // Step 3: Beneficiaries (optional)
    cy.get('button').contains('Next').click()
    
    // Step 4: Pricing (select plan)
    cy.get('button').contains('Next').click()
    
    // Step 5: Summary and Submit
    cy.get('h2').should('contain', 'Review Your Information')
    cy.get('button').contains('Complete Registration').click()
    
    // Should show success message then redirect to dashboard
    cy.get('.border-success', { timeout: 10000 }).should('be.visible')
    cy.url({ timeout: 15000 }).should('include', '/dashboard/overview')
  })

  it('should validate required fields on step 1', () => {
    cy.get('button').contains('Next').should('be.disabled')
    
    // Fill required fields
    cy.get('input[placeholder*="Full name"]').type('John Doe')
    cy.get('input[type="date"]').type('1985-05-15')
    
    cy.get('button').contains('Next').should('still.be.disabled')
    
    // Complete address
    cy.get('input[placeholder*="Street address"]').type('123 Main St')
    cy.get('input[placeholder*="City"]').type('Anytown')
    cy.get('select').first().select('CA')
    cy.get('input[placeholder*="ZIP"]').type('12345')
    cy.get('input[placeholder*="phone"]').type('+1234567890')
    
    cy.get('button').contains('Next').should('not.be.disabled')
  })

  it('should handle form submission errors gracefully', () => {
    // Navigate to summary step
    cy.get('input[placeholder*="Full name"]').type('John Doe')
    cy.get('input[type="date"]').type('1985-05-15')
    cy.get('input[placeholder*="Street address"]').type('123 Main St')
    cy.get('input[placeholder*="City"]').type('Anytown')
    cy.get('select').first().select('CA')
    cy.get('input[placeholder*="ZIP"]').type('12345')
    cy.get('input[placeholder*="phone"]').type('+1234567890')
    
    cy.get('button').contains('Next').click()
    cy.get('button').contains('Next').click()
    cy.get('button').contains('Next').click()
    
    // Mock API error
    cy.intercept('POST', '**/rest/v1/users*', {
      statusCode: 500,
      body: { error: 'Database error' }
    }).as('submitError')
    
    cy.get('button').contains('Complete Registration').click()
    
    // Should show error message
    cy.get('.alert-destructive', { timeout: 10000 }).should('be.visible')
    cy.get('button').contains('Retry').should('be.visible')
  })
})