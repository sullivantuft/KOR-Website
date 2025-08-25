# Legacy Parameter Handling System

This React app now includes comprehensive support for handling URL parameters the same way as the legacy system. This enables seamless compatibility between the old and new systems.

## Overview

The legacy parameter system handles subscription-based authorization using URL query parameters, matching the behavior of the original KOR shop system.

## Core Parameters

The system recognizes these legacy parameters:

- `sub_id` - Subscription ID from purchase
- `invoice_id` - Invoice ID from purchase  
- `plan_type` - Plan type (Basic, Premium, etc.)
- `shop_code` - Shop identifier code
- `shop_name` - Shop name
- `success` - Success flag for redirects
- `error` - Error message parameter

## Key Components

### 1. `useLegacyParams` Hook
Located: `src/hooks/useLegacyParams.ts`

```typescript
import { useLegacyParams } from '../hooks/useLegacyParams';

const params = useLegacyParams();
console.log(params.sub_id, params.invoice_id, params.plan_type);
```

### 2. `LegacyAuthGuard` Component
Located: `src/components/auth/LegacyAuthGuard.tsx`

Protects routes requiring valid subscription parameters:

```typescript
<LegacyAuthGuard requiresAuth={true}>
  <ShopDashboard />
</LegacyAuthGuard>
```

### 3. `ShopSignIn` Component
Located: `src/components/shop/ShopSignIn.tsx`

Handles shop registration with parameter validation.

## Routes

### Legacy-Compatible Routes
- `/shop/signin` - New React shop sign-in
- `/shop_tools/signin` - Legacy-compatible URL
- `/shop_tools/dashboard` - Legacy-compatible dashboard URL

### Testing Route
- `/demo/legacy-params` - Parameter testing interface

## Usage Examples

### Basic Parameter Reading
```typescript
import { useLegacyParams, logLegacyParams } from '../hooks/useLegacyParams';

const MyComponent = () => {
  const params = useLegacyParams();
  
  useEffect(() => {
    logLegacyParams(params, 'MyComponent');
  }, [params]);
  
  return <div>Plan: {params.plan_type}</div>;
};
```

### Authorization Check
```typescript
import { useLegacyParams, checkLegacyAuthorization } from '../hooks/useLegacyParams';

const params = useLegacyParams();
const isAuthorized = checkLegacyAuthorization(params);

if (!isAuthorized) {
  return <div>Access denied</div>;
}
```

### Building URLs with Parameters
```typescript
import { buildLegacyUrl } from '../hooks/useLegacyParams';

const successUrl = buildLegacyUrl('/shop/dashboard', {
  success: 'true',
  plan_type: 'Premium',
  shop_name: 'My Shop'
});
```

## Testing

### Test URLs
Visit these URLs to test parameter handling:

**Authorized (all required parameters):**
```
http://localhost:3000/demo/legacy-params?sub_id=123456&invoice_id=789012&plan_type=Premium
```

**With success flag:**
```
http://localhost:3000/shop/dashboard?sub_id=123456&invoice_id=789012&plan_type=Basic&success=true&shop_name=Test%20Shop
```

**Unauthorized (missing parameters):**
```
http://localhost:3000/shop/signin?sub_id=123456
```

### Testing Flow
1. Navigate to `/demo/legacy-params`
2. Use the test buttons to log parameters and test URL building
3. Click the test links to see authorization in action
4. Check the browser console for logged parameters

## Authorization Logic

The system requires all three core parameters for authorization:
- `sub_id` must be present
- `invoice_id` must be present  
- `plan_type` must be present

Missing any parameter results in unauthorized access.

## Console Logging

The system includes detailed logging matching the legacy system:
```javascript
console.log('[Component] Parameters:', params);
console.log('sub_id:', params.sub_id);
console.log('invoice_id:', params.invoice_id);
console.log('plan_type:', params.plan_type);
```

## Integration with Auth0

The system works alongside Auth0 authentication:
- Parameters are preserved during Auth0 redirects
- Success URLs include legacy parameters
- Dashboard displays parameter-based shop information

## Deployment Notes

- The demo route (`/demo/legacy-params`) should be removed in production
- Parameter logging can be disabled by removing console.log statements
- Authorization logic can be customized in `checkLegacyAuthorization`

## Troubleshooting

**Parameters not reading correctly:**
- Check URL format: `?param1=value1&param2=value2`
- Verify parameter names match exactly (case-sensitive)
- Use the demo page to debug parameter values

**Authorization always failing:**
- Ensure all three required parameters are present
- Check for URL encoding issues with special characters
- Verify parameter values are not empty strings

**Component not updating:**
- Make sure to include `params` in dependency arrays
- Check that the component is properly wrapped in Router context
