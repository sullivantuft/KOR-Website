import React from 'react';
import { useLegacyParams, logLegacyParams, buildLegacyUrl, checkLegacyAuthorization } from '../../hooks/useLegacyParams';
import LegacyAuthGuard from '../auth/LegacyAuthGuard';

const LegacyParamsDemo: React.FC = () => {
  const params = useLegacyParams();
  const isAuthorized = checkLegacyAuthorization(params);

  const handleLogParams = () => {
    logLegacyParams(params, 'Demo');
  };

  const handleTestUrl = () => {
    const testUrl = buildLegacyUrl('/shop/dashboard', {
      sub_id: '123456',
      invoice_id: '789012',
      plan_type: 'Premium',
      success: 'true'
    });
    console.log('Test URL:', testUrl);
    window.history.pushState({}, '', testUrl);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1>Legacy Parameter Testing</h1>
      
      {/* Current Parameters Display */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Current Parameters</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <div><strong>sub_id:</strong> {params.sub_id || 'null'}</div>
          <div><strong>invoice_id:</strong> {params.invoice_id || 'null'}</div>
          <div><strong>plan_type:</strong> {params.plan_type || 'null'}</div>
          <div><strong>shop_code:</strong> {params.shop_code || 'null'}</div>
          <div><strong>shop_name:</strong> {params.shop_name || 'null'}</div>
          <div><strong>success:</strong> {params.success || 'null'}</div>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <strong>Authorization Status:</strong>{' '}
          <span style={{ 
            color: isAuthorized ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {isAuthorized ? '✓ Authorized' : '✗ Not Authorized'}
          </span>
        </div>
      </div>

      {/* Testing Buttons */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Test Functions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleLogParams}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Log Parameters
          </button>
          
          <button
            onClick={handleTestUrl}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test URL Builder
          </button>
        </div>
      </div>

      {/* Test URLs */}
      <div style={{
        backgroundColor: '#e9ecef',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Test These URLs</h2>
        <p>Try these URLs to test parameter handling:</p>
        
        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Authorized (all parameters):</strong><br />
            <a href="?sub_id=123456&invoice_id=789012&plan_type=Premium">
              {window.location.pathname}?sub_id=123456&invoice_id=789012&plan_type=Premium
            </a>
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>With success flag:</strong><br />
            <a href="?sub_id=123456&invoice_id=789012&plan_type=Basic&success=true&shop_name=Test%20Shop">
              {window.location.pathname}?sub_id=123456&invoice_id=789012&plan_type=Basic&success=true&shop_name=Test%20Shop
            </a>
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Missing parameters (unauthorized):</strong><br />
            <a href="?sub_id=123456">
              {window.location.pathname}?sub_id=123456
            </a>
          </div>
        </div>
      </div>

      {/* Auth Guard Demo */}
      <div>
        <h2>Authorization Guard Demo</h2>
        <LegacyAuthGuard requiresAuth={true}>
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            🎉 This content is only visible when you have valid legacy parameters!
            <br />
            <small>You need sub_id, invoice_id, and plan_type parameters to see this.</small>
          </div>
        </LegacyAuthGuard>
      </div>
    </div>
  );
};

export default LegacyParamsDemo;
