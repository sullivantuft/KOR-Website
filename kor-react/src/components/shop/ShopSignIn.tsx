import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import LegacyAuthGuard from '../auth/LegacyAuthGuard';
import { useLegacyParams, buildLegacyUrl, logLegacyParams } from '../../hooks/useLegacyParams';

interface FormData {
  shop_name: string;
  email: string;
  password: string;
  phone: string;
  shop_initials: string;
}

const ShopSignIn: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const params = useLegacyParams();
  
  const [formData, setFormData] = useState<FormData>({
    shop_name: '',
    email: '',
    password: '',
    phone: '',
    shop_initials: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    logLegacyParams(params, 'ShopSignIn');
  }, [params]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const re = /^[+]?[1-9]?[0-9]{7,15}$/;
    return re.test(phone.replace(/[\s\-()]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.shop_name.trim()) {
      setError('Please enter your shop name');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!formData.shop_initials.trim()) {
      setError('Please enter shop initials');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate account creation like the legacy system
      console.log('Shop signup initiated with legacy parameters');
      console.log('Form data:', formData);
      console.log('Legacy params:', params);

      // Here you would integrate with your backend API
      // For now, we'll simulate the process and redirect
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Build success URL with parameters
      const successUrl = buildLegacyUrl('/shop/dashboard', {
        success: 'true',
        plan_type: params.plan_type || 'Basic',
        shop_name: formData.shop_name,
        shop_code: formData.shop_initials.toUpperCase()
      });

      // Redirect to dashboard with success parameters
      navigate(successUrl);

    } catch (error) {
      console.error('Shop signup error:', error);
      setError('An error occurred during account creation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthWithAuth0 = async () => {
    try {
      // Build return URL with current parameters
      const returnUrl = buildLegacyUrl('/shop/dashboard', params);
      
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: window.location.origin + returnUrl
        }
      });
    } catch (error) {
      console.error('Auth0 login error:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  const handleAuthorizationChange = (authorized: boolean) => {
    // Authorization status changed - could be used for additional logic
    console.log('Authorization status:', authorized);
  };

  const signInContent = (
    <div className="page-container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/images/KOR_app_Logo.png"
            alt="KOR Logo"
            style={{ width: '80px', height: '80px', marginBottom: '1rem' }}
          />
          <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Create Shop Account</h1>
          <p style={{ color: '#666', marginBottom: '0' }}>
            Join the KOR network and start managing your bike services
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffe6e6',
            color: '#d63031',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #d63031'
          }}>
            {error}
          </div>
        )}

        {/* Display current parameters for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.8rem'
          }}>
            <strong>Debug - Legacy Parameters:</strong>
            <br />
            Sub ID: {params.sub_id || 'None'}
            <br />
            Invoice ID: {params.invoice_id || 'None'}
            <br />
            Plan Type: {params.plan_type || 'None'}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label htmlFor="shop_name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Shop Name
              </label>
              <input
                type="text"
                id="shop_name"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleInputChange}
                placeholder="Enter your shop name"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="shop@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a secure password"
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="shop_initials" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Shop Initials
              </label>
              <input
                type="text"
                id="shop_initials"
                name="shop_initials"
                value={formData.shop_initials}
                onChange={handleInputChange}
                placeholder="e.g., GC"
                required
                maxLength={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                2-4 characters (e.g., "GC" for George's Cycles)
              </small>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span style={{ color: '#666' }}>- OR -</span>
            </div>

            <button
              type="button"
              onClick={handleAuthWithAuth0}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Sign in with Auth0
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: '#666' }}>
              Already have an account?{' '}
              <a href="/shop/login" style={{ color: '#007bff' }}>Sign In</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <LegacyAuthGuard 
      requiresAuth={true}
      onAuthorizationChange={handleAuthorizationChange}
    >
      {signInContent}
    </LegacyAuthGuard>
  );
};

export default ShopSignIn;
