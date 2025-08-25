import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

// Legacy parameter interface matching the old system
export interface LegacyParams {
  sub_id: string | null;
  invoice_id: string | null;
  plan_type: string | null;
}

// Extended interface for additional parameters
export interface ExtendedLegacyParams extends LegacyParams {
  shop_code?: string | null;
  shop_name?: string | null;
  success?: string | null;
  error?: string | null;
  source?: string | null; // Added to track data source (api, params, localStorage)
}

// Custom hook to handle legacy URL parameters like the old system
export const useLegacyParams = (): ExtendedLegacyParams => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const params = {
      // Core legacy parameters
      sub_id: searchParams.get('sub_id'),
      invoice_id: searchParams.get('invoice_id'),
      plan_type: searchParams.get('plan_type'),
      
      // Extended parameters for shop functionality
      shop_code: searchParams.get('shop_code'),
      shop_name: searchParams.get('shop_name'),
      success: searchParams.get('success'),
      error: searchParams.get('error'),
      source: searchParams.get('source'), // Track data source
    };
    
    // Log parameter changes in development
    if (process.env.NODE_ENV === 'development') {
      const hasParams = Object.values(params).some(value => value !== null);
      if (hasParams) {
        console.log('🔗 [useLegacyParams] Parameters updated:', {
          url: window.location.href,
          params: Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== null)),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return params;
  }, [searchParams]);
};

// Authorization utility matching legacy system logic
export const checkLegacyAuthorization = (params: LegacyParams): boolean => {
  const hasValidParams = params.sub_id && params.invoice_id && params.plan_type;
  
  if (!hasValidParams) {
    console.log('Legacy authorization failed - missing required parameters:', params);
    return false;
  }
  
  console.log('Legacy authorization successful with parameters:', params);
  return true;
};

// Utility to build legacy URLs with parameters
export const buildLegacyUrl = (
  basePath: string, 
  params: Partial<ExtendedLegacyParams>
): string => {
  const url = new URL(basePath, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.pathname + url.search;
};

// Log parameters for debugging (similar to legacy console.log statements)
export const logLegacyParams = (params: ExtendedLegacyParams, context?: string): void => {
  const prefix = context ? `[${context}]` : '[Legacy Params]';
  console.log(`${prefix} Parameters:`, params);
  
  // Individual logging like the legacy system
  if (params.sub_id) console.log('sub_id:', params.sub_id);
  if (params.invoice_id) console.log('invoice_id:', params.invoice_id);
  if (params.plan_type) console.log('plan_type:', params.plan_type);
  if (params.shop_code) console.log('shop_code:', params.shop_code);
  if (params.shop_name) console.log('shop_name:', params.shop_name);
};
