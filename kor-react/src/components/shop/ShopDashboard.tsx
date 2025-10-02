import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useLegacyParams, logLegacyParams } from '../../hooks/useLegacyParams';
import QrCodeGenerator from '../common/QrCodeGenerator';
import SubscriptionDetails from '../subscription/SubscriptionDetails';
import ShopUsersAndBikes from './ShopUsersAndBikes';
import SendNotificationsPanel from './SendNotificationsPanel';
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

//TODO create family plan 
const getPlanFeatures = (planType: string): PlanFeatures => {
  const plans: { [key: string]: PlanFeatures } = {
    'basic': {
      name: 'Basic Plan',
      maxCustomers: 50,
      maxNotifications: 100,
      features: ['Customer Management', 'Basic Notifications', 'Email Support'],
      color: '#17a2b8',
      description: 'Perfect for small bike shops getting started with KOR'
    },
    'premium': {
      name: 'Premium Plan',
      maxCustomers: -1, // Unlimited customers
      maxNotifications: -1, // Unlimited notifications
      features: ['Advanced Customer Management', 'Unlimited Notifications', 'Priority Support', 'Analytics Dashboard', 'Custom Campaigns'],
      color: '#28a745',
      description: 'Full-featured plan for growing bike shops'
    },
    'pro': {
      name: 'Pro Plan',
      maxCustomers: -1, // Unlimited customers
      maxNotifications: -1, // Unlimited notifications
      features: ['Pro Customer Management', 'Unlimited Everything', '24/7 Support', 'Advanced Analytics', 'Custom Integrations'], // Removed 'API Access'
      color: '#6f42c1',
      description: 'Complete solution for large bike shop networks'
    }
  };
  
  return plans[planType] || plans['basic'];
};

const ShopDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();
  const params = useLegacyParams();
  const [shopUser, setShopUser] = useState<ShopUser | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Live customer usage state
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [customerCountLoading, setCustomerCountLoading] = useState(false);
  const [customerCountError, setCustomerCountError] = useState<string | null>(null);

  // Auth0 loading timeout protection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (isLoading) {
      console.log('⏳ [ShopDashboard] Auth0 loading started, setting 8s timeout...');
      // If Auth0 is still loading after 8 seconds, show manual login option but do not auto-redirect
      timeoutId = setTimeout(() => {
        console.log('⚠️ [ShopDashboard] Auth0 loading timeout reached, showing manual login option (no auto-redirect)');
        setLoadingTimeout(true);
      }, 8000); // reduce timeout and avoid forced navigation
    } else {
      console.log('✅ [ShopDashboard] Auth0 loading completed:', { isAuthenticated, hasUser: !!user });
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, navigate, user, isAuthenticated]);

  // Handle authentication state changes
  useEffect(() => {
    // If there's an Auth0 error, handle based on error type
    if (error) {
      console.error('❌ [ShopDashboard] Auth0 error detected:', error);
      
      // Check if it's a 403/authorization error that might be resolved by clearing cache
      const is403Error = error.message.includes('403') || 
                        error.message.includes('Forbidden') ||
                        error.message.includes('access_denied') ||
                        error.message.includes('unauthorized') ||
                        error.message.toLowerCase().includes('token');
      
      if (is403Error) {
        console.log('🔄 [ShopDashboard] 403/Auth error detected - attempting cache reset...');
        
        try {
          // Clear Auth0 cache
          const auth0Cache = localStorage.getItem('@@auth0spajs@@');
          if (auth0Cache) {
            console.log('🧹 [ShopDashboard] Clearing Auth0 cache...');
            localStorage.removeItem('@@auth0spajs@@');
          }
          
          // Clear any Auth0 related items from localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.includes('auth0') || key.includes('@@')) {
              console.log(`🧹 [ShopDashboard] Removing cached item: ${key}`);
              localStorage.removeItem(key);
            }
          });
          
          // Clear sessionStorage as well (but preserve our shop data)
          const preservedData = {
            shop_name: sessionStorage.getItem('shop_name'),
            shop_code: sessionStorage.getItem('shop_code'),
            plan_type: sessionStorage.getItem('plan_type'),
            shop_token: sessionStorage.getItem('shop_token')
          };
          
          // Clear Auth0 session data
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('auth0') || key.includes('@@')) {
              console.log(`🧹 [ShopDashboard] Removing session item: ${key}`);
              sessionStorage.removeItem(key);
            }
          });
          
          // Restore preserved shop data
          Object.entries(preservedData).forEach(([key, value]) => {
            if (value) {
              sessionStorage.setItem(key, value);
            }
          });
          
          console.log('✅ [ShopDashboard] Cache cleared - forcing page reload for fresh auth...');
          
          // Force a page reload to trigger fresh Auth0 initialization
          setTimeout(() => {
            window.location.reload();
          }, 100);
          
          return; // Exit early, page will reload
          
        } catch (cacheError) {
          console.error('❌ [ShopDashboard] Error clearing cache:', cacheError);
          // Fallback to regular login redirect if cache clearing fails
        }
      }
      
      // For non-403 errors or if cache clearing failed, redirect to login
      console.log('🚑 [ShopDashboard] Redirecting to login due to auth error...');
      navigate('/shop/login');
      return;
    }

    // If loading finished and user is not authenticated
    // Only redirect if we do NOT have session-based shop data
    const hasSessionShopData = !!(sessionStorage.getItem('shop_name') && sessionStorage.getItem('plan_type'));
    if (!isLoading && !isAuthenticated && !hasSessionShopData) {
      console.log('🚑 [ShopDashboard] User not authenticated and no session shop data, redirecting to login...');
      navigate('/shop/login');
      return;
    }

    if (!isLoading && !isAuthenticated && hasSessionShopData) {
      console.log('🟡 [ShopDashboard] Not authenticated yet, but session shop data exists - staying on dashboard (soft load)');
    }

    // If user is authenticated, log success
    if (!isLoading && isAuthenticated) {
      console.log('✅ [ShopDashboard] User is authenticated and ready');
    }
  }, [isAuthenticated, isLoading, navigate, error]);

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
      const planTypeRaw = (params.plan_type || sessionStorage.getItem('plan_type') || 'basic').toString();
      const normalizedPlanType = planTypeRaw.toLowerCase();
      const features = getPlanFeatures(normalizedPlanType);
      setPlanFeatures(features);
      
      const shopUserData = {
        email: user.email || '',
        name: user.name || user.email || 'Shop Owner',
        shopName: params.shop_name || sessionStorage.getItem('shop_name') || user.nickname || `${features.name.split(' ')[0]} Bike Shop`,
        shopCode: params.shop_code || sessionStorage.getItem('shop_code') || 'SHOP' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        subscription: {
          plan: planTypeRaw,
          status: 'active',
          nextBilling: '2024-02-15',
          subId: params.sub_id || undefined,
          invoiceId: params.invoice_id || undefined
        }
      };
      
      console.log('🏢 [ShopDashboard] Setting shop user data:', {
        planType: normalizedPlanType,
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

  // Soft prefill from sessionStorage to speed up refresh experience
  useEffect(() => {
    const sessionData = {
      shop_name: sessionStorage.getItem('shop_name'),
      shop_code: sessionStorage.getItem('shop_code'),
      plan_type: sessionStorage.getItem('plan_type')
    };
    if (!shopUser && sessionData.shop_name && sessionData.plan_type) {
      const planTypeRaw = (sessionData.plan_type || 'basic').toString();
      const normalizedPlanType = planTypeRaw.toLowerCase();
      const features = getPlanFeatures(normalizedPlanType);
      setPlanFeatures((prev) => prev || features);
      setShopUser({
        email: '',
        name: 'Shop Owner',
        shopName: sessionData.shop_name || undefined,
        shopCode: sessionData.shop_code || undefined,
        subscription: {
          plan: planTypeRaw,
          status: 'active'
        }
      });
      console.log('⚡ [ShopDashboard] Prefilled dashboard from sessionStorage while auth initializes');
    }
  }, [shopUser]);

  // Fetch live customer count using existing backend API (works during soft-auth too)
  useEffect(() => {
    const shop_token = sessionStorage.getItem('shop_token');
    if (!shop_token) {
      console.log('ℹ️ [ShopDashboard] No shop_token in sessionStorage; skipping user count fetch.');
      return;
    }

    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://jmrcycling.com:3001';
    const authToken = process.env.REACT_APP_API_AUTH_TOKEN || '1893784827439273928203838';

    setCustomerCountLoading(true);
    setCustomerCountError(null);

    (async () => {
      try {
        const response = await fetch(`${baseUrl}/getShopUsers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ auth: authToken, shop_token }) as unknown as BodyInit,
          redirect: 'follow' as RequestRedirect
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status} ${errText}`);
        }

        const data = await response.json();
        if (data && data.message === 'success') {
          const count = typeof data.user_count === 'number' ? data.user_count : Array.isArray(data.users) ? data.users.length : 0;
          setCustomerCount(count);
          console.log('👥 [ShopDashboard] Loaded customer count:', count);
        } else {
          throw new Error(data?.error || 'Failed to load user count');
        }
      } catch (err) {
        console.error('❌ [ShopDashboard] Failed to fetch shop user count:', err);
        setCustomerCountError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setCustomerCountLoading(false);
      }
    })();
  }, [isAuthenticated, shopUser?.shopCode]);


  // Allow the dashboard to render if we have session-based shop data, even while Auth0 initializes
  const hasSessionShopData = !!(typeof window !== 'undefined' && sessionStorage.getItem('shop_name') && sessionStorage.getItem('plan_type'));

  if ((isLoading || loadingTimeout) && !hasSessionShopData) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: loadingTimeout ? '4px solid #e74c3c' : '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}/>
        </div>
        <p style={{ color: loadingTimeout ? '#e74c3c' : '#666' }}>
          {loadingTimeout ? 'Authentication taking longer than usual...' : 'Loading dashboard...'}
        </p>
        
        {/* Auth0 Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#ffe6e6',
            color: '#d63031',
            padding: '1rem',
            borderRadius: '4px',
            marginTop: '1rem',
            border: '1px solid #d63031',
            maxWidth: '400px',
            margin: '1rem auto 0'
          }}>
            <p><strong>Authentication Error:</strong></p>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>{error.message}</p>
          </div>
        )}
        
        {/* Progress indicator for loading */}
        {isLoading && !loadingTimeout && (
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#f3f3f3',
            borderRadius: '2px',
            margin: '1rem auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              backgroundColor: '#3498db',
              borderRadius: '2px',
              animation: 'progress 2s ease-in-out infinite'
            }} />
          </div>
        )}
        
        {/* Manual redirect button if loading takes too long */}
        {(isLoading || loadingTimeout) && (
          <button
            onClick={() => {
              console.log('🔄 [ShopDashboard] Manual redirect to login triggered');
              navigate('/shop/login');
            }}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '2rem',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5a6fd8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
            }}
          >
            Continue to Login →
          </button>
        )}
        
        {/* CSS Animation for progress bar */}
        <style>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated but we have session-based shop data, allow soft rendering
  if (!isAuthenticated && !hasSessionShopData) {
    return null; // Will redirect to login (or show loader if above)
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

      {/* Getting Started Section (moved just below Plan Features banner) */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '1rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Getting Started with JMR Cycling</h2>
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

      {/* QR Code Section - Matching Legacy Dashboard */}
      {shopUser?.shopCode && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>📱 Customer QR Code</h2>
          <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            <strong>Seamless customer onboarding for your bike shop!</strong>
          </p>
          <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Customers scan → Auto-redirect to app store → App pre-filled with shop code → Instant login!
          </p>
          
          {/* Legacy-style benefits display */}
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '1px solid #28a745',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'inline-block',
            maxWidth: '500px'
          }}>
            <h3 style={{ color: '#28a745', marginTop: 0, marginBottom: '0.5rem' }}>✨ What's Improved</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: '#e67e22' }}>😕 Before (7 steps)</strong>
                <ol style={{ textAlign: 'left', fontSize: '0.8rem', paddingLeft: '1rem' }}>
                  <li>Get shop code from staff</li>
                  <li>Download app manually</li>
                  <li>Open app</li>
                  <li>Navigate to login</li>
                  <li>Type shop code</li>
                  <li>Tap continue</li>
                  <li>Complete Strava auth</li>
                </ol>
              </div>
              <div>
                <strong style={{ color: '#28a745' }}>😊 After (3 steps)</strong>
                <ol style={{ textAlign: 'left', fontSize: '0.8rem', paddingLeft: '1rem' }}>
                  <li><strong>Scan QR code</strong></li>
                  <li><strong>App opens automatically</strong></li>
                  <li><strong>Complete Strava auth</strong></li>
                </ol>
                <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>
                  ✨ Shop code auto-filled!
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Generator */}
          <QrCodeGenerator 
            shopCode={shopUser.shopCode}
            shopName={shopUser.shopName}
            size={200}
            onError={(error) => console.error('QR Code Error:', error)}
          />
          
          {/* Instructions for shop owners */}
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '2rem',
            maxWidth: '600px',
            margin: '2rem auto 0'
          }}>
            <h4 style={{ color: '#333', marginTop: 0 }}>💡 How to Use Your QR Code</h4>
            <div style={{ textAlign: 'left', lineHeight: 1.6 }}>
              <p><strong>For your customers:</strong></p>
              <blockquote style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                fontStyle: 'italic',
                margin: '1rem 0'
              }}>
                "Scan this QR code with your phone to get our bike maintenance app - it'll set everything up automatically!"
              </blockquote>
              
              <p><strong>Ways to share:</strong></p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>📄 <strong>Print it</strong> and display prominently in your shop</li>
                <li>💳 <strong>Add to business cards</strong> or promotional materials</li>
                <li>📧 <strong>Share digitally</strong> via email or social media</li>
                <li>📱 <strong>Show on tablet/phone</strong> for customers to scan</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Users & Bikes Section */}
      <div style={{ marginTop: '2rem' }}>
        <ShopUsersAndBikes accentColor={planFeatures?.color || '#667eea'} />
      </div>

      {/* Premium/Pro: Send Notifications */}
      {(() => {
        const planTypeParam = (params.plan_type || sessionStorage.getItem('plan_type') || '').toString().toLowerCase();
        const canSendNotifications = planTypeParam === 'premium' || planTypeParam === 'pro';
        return canSendNotifications ? (
          <div style={{ marginTop: '2rem' }}>
            <SendNotificationsPanel />
          </div>
        ) : null;
      })()}

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
            <p><strong>Email:</strong> {shopUser?.email}</p>
            {shopUser?.shopCode && <p><strong>Shop Code:</strong> <code style={{ backgroundColor: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{shopUser.shopCode}</code></p>}
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
                <span>{customerCountLoading ? 'Loading…' : (customerCount ?? 0)} / {planFeatures?.maxCustomers === -1 ? '∞' : planFeatures?.maxCustomers}</span>
              </div>
              {planFeatures?.maxCustomers !== -1 && (
                <div style={{ backgroundColor: '#e9ecef', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    backgroundColor: planFeatures?.color || '#007bff', 
                    height: '100%', 
                    width: `${(planFeatures?.maxCustomers && planFeatures.maxCustomers > 0 && (customerCount ?? 0) >= 0) ? Math.min(100, Math.round(((customerCount ?? 0) / planFeatures.maxCustomers) * 100)) : 0}%` 
                  }}></div>
                </div>
              )}
              {customerCountError && (
                <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.5rem' }}>Error loading customers: {customerCountError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Subscription Details from Chargebee API */}
      <div style={{ marginTop: '2rem' }}>
        <SubscriptionDetails
          subscriptionId={shopUser?.subscription?.subId}
          onError={(error) => console.error('Subscription Details Error:', error)}
          onLoading={(loading) => console.log('Subscription Details Loading:', loading)}
        />
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
                  {!feature.includes('Customer') && !feature.includes('Notification') && !feature.includes('Support') && !feature.includes('Analytics') && !feature.includes('Campaign') && !feature.includes('Integration') && 'Available in your current plan'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}


      


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
          Questions about your {shopUser?.subscription?.plan} plan? <a href="/contact" style={{ color: planFeatures?.color || '#007bff' }}>Contact our support team</a>
        </p>
      </div>
    </div>
  );
};

export default ShopDashboard;
