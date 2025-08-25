import React, { useEffect, useState } from 'react';
import { useLegacyParams, checkLegacyAuthorization, logLegacyParams } from '../../hooks/useLegacyParams';

interface LegacyAuthGuardProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  fallbackComponent?: React.ComponentType;
  onAuthorizationChange?: (authorized: boolean) => void;
}

// Default unauthorized access component (matching legacy styling)
const DefaultUnauthorizedAccess: React.FC = () => (
  <div
    style={{
      backgroundColor: '#ff4444',
      color: 'white',
      padding: '2rem',
      borderRadius: '8px',
      margin: '2rem auto',
      maxWidth: '600px',
      textAlign: 'center'
    }}
  >
    <h1 style={{ marginBottom: '1rem', color: 'white' }}>Access Denied</h1>
    <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
      You need valid subscription parameters to access this page.
      If you think you should have access, please reach out to us on our{' '}
      <a
        href="/contact"
        style={{ color: '#ffdddd', textDecoration: 'underline' }}
      >
        contact page
      </a>
      .
    </p>
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '1rem',
        borderRadius: '4px',
        marginTop: '1rem'
      }}
    >
      <p style={{ margin: 0, fontSize: '0.9em', opacity: 0.9 }}>
        To access this page, you need valid subscription and invoice IDs
        from your KOR purchase.
      </p>
    </div>
  </div>
);

// Authorization guard component matching legacy system behavior
const LegacyAuthGuard: React.FC<LegacyAuthGuardProps> = ({
  children,
  requiresAuth = true,
  fallbackComponent: FallbackComponent = DefaultUnauthorizedAccess,
  onAuthorizationChange
}) => {
  const params = useLegacyParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Log parameters like the legacy system
    logLegacyParams(params, 'LegacyAuthGuard');

    if (!requiresAuth) {
      setIsAuthorized(true);
      setIsLoading(false);
      onAuthorizationChange?.(true);
      return;
    }

    // Check authorization using legacy logic
    const authorized = checkLegacyAuthorization(params);
    setIsAuthorized(authorized);
    setIsLoading(false);
    
    // Notify parent component of authorization change
    onAuthorizationChange?.(authorized);

    if (!authorized) {
      console.log('Access denied - redirecting to unauthorized view');
    }
  }, [params, requiresAuth, onAuthorizationChange]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}
        />
        <p>Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized && requiresAuth) {
    return <FallbackComponent />;
  }

  return <>{children}</>;
};

export default LegacyAuthGuard;
