import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useLegacyParams, logLegacyParams, buildLegacyUrl } from '../../hooks/useLegacyParams';

interface ShopUser {
  email: string;
  name: string;
  shopName?: string;
  shopCode?: string;
  subscription?: {
    plan: string;
    status: string;
    nextBilling?: string;
    subId?: string;
    invoiceId?: string;
  };
}

// Plan-specific features and limits
interface PlanFeatures {
  name: string;
  maxCustomers: number;
  maxNotifications: number;
  features: string[];
  color: string;
  description: string;
}

// Plan configurations based on legacy system
const getPlanFeatures = (planType: string): PlanFeatures => {
  const plans: { [key: string]: PlanFeatures } = {
    'Basic': {
      name: 'Basic Plan',
      maxCustomers: 50,
      maxNotifications: 100,
      features: ['Customer Management', 'Basic Notifications', 'Email Support'],
      color: '#17a2b8',
      description: 'Perfect for small bike shops getting started with KOR'
    },
    'Premium': {
      name: 'Premium Plan',
      maxCustomers: 200,
      maxNotifications: 500,
      features: ['Advanced Customer Management', 'Unlimited Notifications', 'Priority Support', 'Analytics Dashboard', 'Custom Campaigns'],
      color: '#28a745',
      description: 'Full-featured plan for growing bike shops'
    },
    'Pro': {
      name: 'Pro Plan',
      maxCustomers: 1000,
      maxNotifications: -1, // Unlimited
      features: ['Pro Customer Management', 'Unlimited Everything', '24/7 Support', 'Advanced Analytics', 'Custom Integrations', 'API Access'],
      color: '#6f42c1',
      description: 'Complete solution for large bike shop networks'
    }
  };
  
  return plans[planType] || plans['Basic'];
};

const ShopDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const navigate = useNavigate();
  const params = useLegacyParams();
  const [shopUser, setShopUser] = useState<ShopUser | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/shop/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Effect to log dashboard access and restore parameters from localStorage
  // Effect to handle data loading from sessionStorage (priority) and URL params (fallback)
  useEffect(() => {
    console.log('🏗️ [ShopDashboard] Dashboard loaded:', {
      isAuthenticated,
      currentUrl: window.location.href,
      currentParams: params,
      timestamp: new Date().toISOString()
    });
    
    if (isAuthenticated) {
      // PRIORITY 1: Check sessionStorage first (legacy API approach)
      const sessionData = {
        shop_name: sessionStorage.getItem('shop_name'),
        shop_code: sessionStorage.getItem('shop_code'),
        plan_type: sessionStorage.getItem('plan_type'),
        shop_token: sessionStorage.getItem('shop_token')
      };
      
      console.log('💾 [ShopDashboard] SessionStorage data check:', sessionData);
      
      if (sessionData.shop_name && sessionData.plan_type) {
        console.log('✅ [ShopDashboard] Using sessionStorage data (legacy API approach)');
        
        // Update URL to reflect sessionStorage data if different
        const currentUrlParams = new URLSearchParams(window.location.search);
        let urlNeedsUpdate = false;
        
        if (currentUrlParams.get('plan_type') !== sessionData.plan_type) {
          currentUrlParams.set('plan_type', sessionData.plan_type);
          urlNeedsUpdate = true;
        }
        if (currentUrlParams.get('shop_name') !== sessionData.shop_name) {
          currentUrlParams.set('shop_name', sessionData.shop_name);
          urlNeedsUpdate = true;
        }
        if (sessionData.shop_code && currentUrlParams.get('shop_code') !== sessionData.shop_code) {
          currentUrlParams.set('shop_code', sessionData.shop_code);
          urlNeedsUpdate = true;
        }
        if (!currentUrlParams.get('source')) {
          currentUrlParams.set('source', 'api');
          urlNeedsUpdate = true;
        }
        
        if (urlNeedsUpdate) {
          const newUrl = `${window.location.pathname}?${currentUrlParams.toString()}`;
          console.log('🔄 [ShopDashboard] Updating URL to match sessionStorage:', newUrl);
          navigate(newUrl, { replace: true });
        }
        
        return; // Exit early, sessionStorage data takes priority
      }
      
      // PRIORITY 2: Check URL parameters (direct access or parameter-based approach)
      const hasUrlParams = window.location.search.includes('plan_type');
      
      if (hasUrlParams) {
        console.log('✅ [ShopDashboard] Using URL parameters (direct/parameter-based approach)');
        return; // URL params are present, use them
      }
      
      // PRIORITY 3: Try to restore from localStorage (fallback for failed flows)
      console.log('🚑 [ShopDashboard] No sessionStorage or URL params, checking localStorage...');
      
      const localStorageParams: Record<string, string> = {};
      const paramsToRestore = ['sub_id', 'invoice_id', 'plan_type', 'shop_name', 'shop_code'];
      
      paramsToRestore.forEach(param => {
        const storedValue = localStorage.getItem(`kor_param_${param}`);
        if (storedValue) {
          localStorageParams[param] = storedValue;
        }
      });
      
      if (Object.keys(localStorageParams).length > 0) {
        console.log('🚑 [ShopDashboard] RESTORING parameters from localStorage!');
        
        const currentUrl = new URL(window.location.href);
        Object.entries(localStorageParams).forEach(([param, value]) => {
          currentUrl.searchParams.set(param, value);
        });
        currentUrl.searchParams.set('source', 'localStorage');
        
        const newUrl = currentUrl.pathname + currentUrl.search;
        console.log('🔄 [ShopDashboard] Redirecting with restored parameters:', newUrl);
        navigate(newUrl, { replace: true });
        
        // Clean up localStorage after restoring
        setTimeout(() => {
          paramsToRestore.forEach(param => {
            localStorage.removeItem(`kor_param_${param}`);
          });
        }, 1000);
      } else {
        console.log('⚠️ [ShopDashboard] No data available in sessionStorage, URL params, or localStorage');
      }
    } else {
      console.log('🚑 [ShopDashboard] User not authenticated, should redirect to login');
    }
  }, [isAuthenticated, params, navigate]);

  useEffect(() => {
    // Log legacy parameters like the old system
    logLegacyParams(params, 'ShopDashboard');
    
    // Check for success parameters from subscription or login
    if (params.success === 'true') {
      setShowSuccessMessage(true);
      // Clear only the success parameter after 5 seconds, preserve others
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Only clear success parameter, keep others
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('success');
        window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
      }, 5000);
    }
  }, [params]);

  useEffect(() => {
    console.log('📊 [ShopDashboard] Shop user data update triggered:', {
      isAuthenticated,
      hasUser: !!user,
      currentParams: params,
      timestamp: new Date().toISOString()
    });
    
    if (isAuthenticated && user) {
      const planType = params.plan_type || 'Basic';
      const features = getPlanFeatures(planType);
      setPlanFeatures(features);
      
      const shopUserData = {
        email: user.email || '',
        name: user.name || user.email || 'Shop Owner',
        shopName: params.shop_name || user.nickname || `${features.name.split(' ')[0]} Bike Shop`,
        shopCode: params.shop_code || 'SHOP' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        subscription: {
          plan: planType,
          status: 'active',
          nextBilling: '2024-02-15',
          subId: params.sub_id || undefined,
          invoiceId: params.invoice_id || undefined
        }
      };
      
      console.log('🏢 [ShopDashboard] Setting shop user data:', {
        planType,
        shopUserData,
        parametersUsed: {
          sub_id: params.sub_id,
          invoice_id: params.invoice_id,
          plan_type: params.plan_type,
          shop_name: params.shop_name,
          shop_code: params.shop_code
        }
      });
      
      // Use legacy parameters for shop data (matching old system)
      setShopUser(shopUserData);
    } else {
      console.log('⚠️ [ShopDashboard] Cannot set shop user data - missing authentication or user data');
    }
  }, [isAuthenticated, user, params]);

  const handleLogout = () => {
    // Build login URL with current parameters preserved
    const loginUrl = buildLegacyUrl('/shop/login', params);
    
    logout({
      logoutParams: {
        returnTo: window.location.origin + loginUrl
      }
    });
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '2rem auto', padding: '2rem' }}>
      {showSuccessMessage && (
        <div style={{
          backgroundColor: '#e6f7e6',
          color: '#00b894',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #00b894',
          textAlign: 'center'
        }}>
          🎉 Welcome to {shopUser?.shopName || 'your'} KOR Dashboard! Your {planFeatures?.name || 'subscription'} is now active.
        </div>
      )}
      
      {/* Header with personalized greeting */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: planFeatures?.color || '#007bff',
        color: 'white',
        borderRadius: '12px',
        backgroundImage: 'linear-gradient(135deg, ' + (planFeatures?.color || '#007bff') + ', ' + (planFeatures?.color || '#007bff') + '90)'
      }}>
        <div>
          <h1 style={{ color: 'white', margin: 0, marginBottom: '0.5rem' }}>Welcome, {shopUser?.shopName}!</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
            {planFeatures?.description || 'Managing your bike shop with KOR'}
          </p>
          {shopUser?.shopCode && (
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Shop Code: <strong>{shopUser.shopCode}</strong>
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Logout
        </button>
      </div>

      {/* Plan-specific information banner */}
      {planFeatures && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          border: `3px solid ${planFeatures.color}`,
          borderLeft: `6px solid ${planFeatures.color}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: planFeatures.color, margin: '0 0 0.5rem 0' }}>{planFeatures.name} Features</h3>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <strong>Customer Limit:</strong> {planFeatures.maxCustomers === -1 ? 'Unlimited' : planFeatures.maxCustomers.toLocaleString()}
                </div>
                <div>
                  <strong>Notifications:</strong> {planFeatures.maxNotifications === -1 ? 'Unlimited' : planFeatures.maxNotifications.toLocaleString()}
                </div>
              </div>
            </div>
            {planFeatures.maxCustomers !== 50 && (
              <div style={{
                backgroundColor: planFeatures.color,
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {planFeatures.name === 'Premium Plan' ? '⭐ POPULAR' : '🚀 Pro'}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Shop Info Card - Enhanced with parameters */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', display: 'flex', alignItems: 'center' }}>
            🏪 Shop Information
          </h3>
          <div style={{ lineHeight: 1.6 }}>
            <p><strong>Shop Name:</strong> {shopUser?.shopName}</p>
            <p><strong>Owner:</strong> {shopUser?.name}</p>
            <p><strong>Email:</strong> {shopUser?.email}</p>
            {shopUser?.shopCode && <p><strong>Shop Code:</strong> <code style={{ backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{shopUser.shopCode}</code></p>}
          </div>
        </div>

        {/* Subscription Card - Enhanced with parameter details */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', display: 'flex', alignItems: 'center' }}>
            💳 Subscription Details
          </h3>
          <div style={{ lineHeight: 1.6 }}>
            <p><strong>Plan:</strong> <span style={{ color: planFeatures?.color || '#007bff' }}>{shopUser?.subscription?.plan}</span></p>
            <p><strong>Status:</strong> <span style={{ color: '#28a745' }}>✓ Active</span></p>
            <p><strong>Next Billing:</strong> {shopUser?.subscription?.nextBilling}</p>
            {shopUser?.subscription?.subId && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                <strong>Sub ID:</strong> <code style={{ backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{shopUser.subscription.subId}</code>
              </p>
            )}
            {shopUser?.subscription?.invoiceId && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                <strong>Invoice ID:</strong> <code style={{ backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{shopUser.subscription.invoiceId}</code>
              </p>
            )}
          </div>
        </div>

        {/* Plan Limits Card - Dynamic based on plan */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', display: 'flex', alignItems: 'center' }}>
            📊 Plan Usage
          </h3>
          <div style={{ lineHeight: 1.6 }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Customers:</strong>
                <span>0 / {planFeatures?.maxCustomers === -1 ? '∞' : planFeatures?.maxCustomers}</span>
              </div>
              <div style={{ backgroundColor: '#e9ecef', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: planFeatures?.color || '#007bff', height: '100%', width: '0%' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>Notifications:</strong>
                <span>0 / {planFeatures?.maxNotifications === -1 ? '∞' : planFeatures?.maxNotifications}</span>
              </div>
              <div style={{ backgroundColor: '#e9ecef', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: planFeatures?.color || '#007bff', height: '100%', width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features Section - Dynamic based on parameters */}
      {planFeatures && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginTop: '2rem'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem', textAlign: 'center' }}>Your {planFeatures.name} Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {planFeatures.features.map((feature, index) => (
              <div key={index} style={{ 
                padding: '1rem',
                textAlign: 'center',
                border: `2px solid ${planFeatures.color}20`,
                borderRadius: '8px',
                backgroundColor: `${planFeatures.color}10`
              }}>
                <h4 style={{ color: planFeatures.color, marginTop: 0 }}>✓ {feature}</h4>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                  {feature === 'Customer Management' && 'Track and manage all your bike service customers'}
                  {feature === 'Basic Notifications' && 'Send service reminders to your customers'}
                  {feature === 'Email Support' && 'Get help via email from our support team'}
                  {feature === 'Advanced Customer Management' && 'Detailed customer profiles and service history'}
                  {feature === 'Unlimited Notifications' && 'Send unlimited maintenance alerts and promotions'}
                  {feature === 'Priority Support' && 'Get faster response times from our team'}
                  {feature === 'Analytics Dashboard' && 'Detailed insights into your shop performance'}
                  {feature === 'Custom Campaigns' && 'Create targeted marketing campaigns'}
                  {feature === 'Pro Customer Management' && 'Multi-location customer management'}
                  {feature === 'Unlimited Everything' && 'No limits on any features'}
                  {feature === '24/7 Support' && 'Round-the-clock support via phone and chat'}
                  {feature === 'Advanced Analytics' && 'Deep business intelligence and reporting'}
                  {feature === 'Custom Integrations' && 'Connect with your existing business tools'}
                  {feature === 'API Access' && 'Build custom integrations with our API'}
                  {!feature.includes('Customer') && !feature.includes('Notification') && !feature.includes('Support') && !feature.includes('Analytics') && !feature.includes('Campaign') && !feature.includes('Integration') && !feature.includes('API') && 'Available in your current plan'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Getting Started with {shopUser?.shopName}</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Your dashboard is being prepared with all the features of your {planFeatures?.name || 'plan'}.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
            <h4 style={{ color: planFeatures?.color || '#007bff' }}>Download KOR App</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Your customers will use your shop code: <strong>{shopUser?.shopCode}</strong></p>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
            <h4 style={{ color: planFeatures?.color || '#007bff' }}>Configure Settings</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Customize notifications and shop preferences</p>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <h4 style={{ color: planFeatures?.color || '#007bff' }}>Start Managing</h4>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Begin tracking customer bike maintenance</p>
          </div>
        </div>
      </div>

      {/* Enhanced Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '2rem',
          fontSize: '0.8rem',
          fontFamily: 'monospace'
        }}>
          <strong>🔍 DEBUG - Data Sources & Authentication:</strong>
          <br /><br />
          <strong>DATA SOURCE PRIORITY:</strong>
          <br />1. SessionStorage (API): {sessionStorage.getItem('shop_name') ? '✅ HAS DATA' : '❌ EMPTY'}
          <br />2. URL Parameters: {window.location.search.includes('plan_type') ? '✅ HAS DATA' : '❌ EMPTY'}
          <br />3. LocalStorage Backup: {localStorage.getItem('kor_param_plan_type') ? '✅ HAS DATA' : '❌ EMPTY'}
          <br /><br />
          <strong>SESSIONSTORAGE (Legacy API Data):</strong>
          <br />Shop Name: {sessionStorage.getItem('shop_name') || 'None'}
          <br />Shop Code: {sessionStorage.getItem('shop_code') || 'None'}
          <br />Plan Type: {sessionStorage.getItem('plan_type') || 'None'}
          <br />Shop Token: {sessionStorage.getItem('shop_token') || 'None'}
          <br /><br />
          <strong>URL PARAMETERS:</strong>
          <br />Current URL: {window.location.href}
          <br />URL Search: {window.location.search || 'EMPTY'}
          <br />Source: {params.source || 'None'}
          <br />Sub ID: {params.sub_id || 'None'}
          <br />Invoice ID: {params.invoice_id || 'None'}
          <br />Plan Type: {params.plan_type || 'None'}
          <br />Shop Name: {params.shop_name || 'None'}
          <br />Shop Code: {params.shop_code || 'None'}
          <br /><br />
          <strong>LOCALSTORAGE BACKUP:</strong>
          <br />Fallback Sub ID: {localStorage.getItem('kor_param_sub_id') || 'None'}
          <br />Fallback Plan Type: {localStorage.getItem('kor_param_plan_type') || 'None'}
          <br />Fallback Shop Name: {localStorage.getItem('kor_param_shop_name') || 'None'}
          <br /><br />
          <strong>CURRENT DATA SOURCE:</strong> {sessionStorage.getItem('shop_name') ? '📊 API (sessionStorage)' : window.location.search.includes('plan_type') ? '📝 URL Parameters' : localStorage.getItem('kor_param_plan_type') ? '💾 LocalStorage Fallback' : '⚠️ No Data Source'}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Questions about your {planFeatures?.name || 'plan'}? <a href="/contact" style={{ color: planFeatures?.color || '#007bff' }}>Contact our support team</a>
        </p>
      </div>
    </div>
  );
};

export default ShopDashboard;
