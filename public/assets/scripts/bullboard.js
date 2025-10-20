// BullBoard Logout Button Injector
(function () {
  'use strict';

  // Wait for DOM to be ready
  function init() {
    injectLogoutButton();
  }

  function injectLogoutButton() {
    // Create logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'bullboard-logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.setAttribute('aria-label', 'Logout from queue dashboard');

    // Apply styles matching admin dashboard logout button
    Object.assign(logoutBtn.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: '600',
      fontFamily: 'inherit',
      color: '#f85149',
      background: 'rgba(248, 81, 73, 0.1)',
      border: '1px solid rgba(248, 81, 73, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
    });

    // Hover effect
    logoutBtn.addEventListener('mouseenter', () => {
      logoutBtn.style.background = 'rgba(248, 81, 73, 0.2)';
      logoutBtn.style.borderColor = '#f85149';
      logoutBtn.style.transform = 'translateY(-1px)';
      logoutBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    });

    logoutBtn.addEventListener('mouseleave', () => {
      if (!logoutBtn.disabled) {
        logoutBtn.style.background = 'rgba(248, 81, 73, 0.1)';
        logoutBtn.style.borderColor = 'rgba(248, 81, 73, 0.3)';
        logoutBtn.style.transform = 'translateY(0)';
        logoutBtn.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
      }
    });

    // Click handler
    logoutBtn.addEventListener('click', handleLogout);

    // Append to body
    document.body.appendChild(logoutBtn);
  }

  async function handleLogout() {
    const btn = document.getElementById('bullboard-logout-btn');
    if (!btn || btn.disabled) return;

    // Set loading state
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Logging out...';
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';

    try {
      // Call logout endpoint
      const response = await fetch('/queues/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        // Redirect to login page
        window.location.href = '/queues/login';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Reset button state on error
      btn.disabled = false;
      btn.textContent = originalText;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      
      // Show error message
      alert('Failed to logout. Please try again.');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

