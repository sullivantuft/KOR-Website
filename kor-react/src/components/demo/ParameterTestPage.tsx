import React from 'react';
import { Link } from 'react-router-dom';
import { useLegacyParams, buildLegacyUrl } from '../../hooks/useLegacyParams';

const ParameterTestPage: React.FC = () => {
  const params = useLegacyParams();

  const sampleParameters = {
    sub_id: 'test_subscription_123',
    invoice_id: 'inv_test_456',
    plan_type: 'Premium',
    shop_name: 'Mountain Bike Pro',
    shop_code: 'MBP123'
  };

  const testUrls = {
    login: buildLegacyUrl('/shop/login', sampleParameters),
    dashboard: buildLegacyUrl('/shop/dashboard', sampleParameters),
    signin: buildLegacyUrl('/shop/signin', sampleParameters),
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>Parameter Testing Page</h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Current URL Parameters</h2>
        {Object.keys(params).some(key => params[key as keyof typeof params]) ? (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            {Object.entries(params).map(([key, value]) => (
              value ? <div key={key}><strong>{key}:</strong> {value}</div> : null
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No parameters found in current URL</p>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Test Links with Sample Parameters</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Click these links to test the parameter preservation through different pages:
        </p>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <Link 
              to={testUrls.login}
              style={{
                display: 'inline-block',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '5px',
                marginRight: '1rem'
              }}
            >
              🔐 Shop Login with Parameters
            </Link>
            <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem 0.5rem', borderRadius: '3px', fontSize: '0.8rem' }}>
              {testUrls.login}
            </code>
          </div>
          
          <div>
            <Link 
              to={testUrls.dashboard}
              style={{
                display: 'inline-block',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '5px',
                marginRight: '1rem'
              }}
            >
              📊 Shop Dashboard with Parameters
            </Link>
            <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem 0.5rem', borderRadius: '3px', fontSize: '0.8rem' }}>
              {testUrls.dashboard}
            </code>
          </div>
          
          <div>
            <Link 
              to={testUrls.signin}
              style={{
                display: 'inline-block',
                backgroundColor: '#6f42c1',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '5px',
                marginRight: '1rem'
              }}
            >
              📝 Shop Sign-In with Parameters
            </Link>
            <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem 0.5rem', borderRadius: '3px', fontSize: '0.8rem' }}>
              {testUrls.signin}
            </code>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Sample Parameters Used</h2>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          <div><strong>sub_id:</strong> {sampleParameters.sub_id}</div>
          <div><strong>invoice_id:</strong> {sampleParameters.invoice_id}</div>
          <div><strong>plan_type:</strong> {sampleParameters.plan_type}</div>
          <div><strong>shop_name:</strong> {sampleParameters.shop_name}</div>
          <div><strong>shop_code:</strong> {sampleParameters.shop_code}</div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>How Parameter Preservation Works</h2>
        <div style={{ lineHeight: 1.6, color: '#666' }}>
          <p><strong>1. Initial Navigation:</strong> Parameters are included in the URL when navigating to shop pages</p>
          <p><strong>2. Login Process:</strong> Parameters are stored in sessionStorage before Auth0 redirect</p>
          <p><strong>3. Auth0 Redirect:</strong> User is redirected to Auth0 for authentication</p>
          <p><strong>4. Return to Dashboard:</strong> Parameters are restored from sessionStorage and added back to URL</p>
          <p><strong>5. Dashboard Display:</strong> Shop information is populated using the restored parameters</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ParameterTestPage;
