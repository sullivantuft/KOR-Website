const query = window.location.search;
if (!(query.includes("sub_id=") && query.includes("invoice_id=") && query.includes("plan_type="))) {
// Development query ?sub_id=test&invoice_id=test&plan_type=basic
    var x = document.getElementById("signin_box");
    if (x.style.display === "none") {
        x.style.display = "block";
        } else {
            elements.submitBtn.removeAttribute('aria-label');
        }
    }
}

function validateForm(formData) {
    const errors = [];
    
    if (!formData.shop_name?.trim()) {
        errors.push('Shop name is required');
    }
    

    // Use replaceState to redirect the user away and remove the querystring parameters
    // window.history.replaceState({}, document.title, "/shop_tools/login.html");
    }
    
    if (!formData.password?.trim()) {
        errors.push('Password is required');
    } else if (formData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!formData.phone?.trim()) {
        errors.push('Phone number is required');
    }
    
    if (!formData.shop_initials?.trim()) {
        errors.push('Shop initials are required');
    } else if (formData.shop_initials.length < 2 || formData.shop_initials.length > 4) {
        errors.push('Shop initials must be 2-4 characters');
    }
    
    return errors;
}

// API Functions
async function getAuth0Token() {
    try {
        const response = await fetch(`${CONFIG.SERVER_BASE_URL}/getauth0Token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ access_token: 'auth0_token' })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get Auth0 token: ${response.status}`);
        }
        
        const result = await response.json();
        return result.token[0].auth0_token;
    } catch (error) {
        console.error('Auth0 token error:', error);
        throw new Error('Failed to obtain authentication token');
    }
}

async function createAuth0User(formData, auth0Token) {
    try {
        const response = await fetch(CONFIG.AUTH0_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${auth0Token}`
            },
            body: new URLSearchParams({
                email: formData.email,
                password: formData.password,
                connection: 'Username-Password-Authentication',
                name: formData.shop_name
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Auth0 user creation failed:', errorText);
            throw new Error('Failed to create user account');
        }
        
        const result = await response.json();
        return result.user_id;
    } catch (error) {
        console.error('Auth0 user creation error:', error);
        throw new Error(error.message || 'Failed to create user account');
    }
}

async function createShopAccount(formData, userId) {
    try {
        const response = await fetch(`${CONFIG.SERVER_BASE_URL}/signinShop`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.BEARER_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                shop_name: formData.shop_name,
                email: formData.email,
                sub_Id: pageParams.sub_id || '',
                invoice_Id: pageParams.invoice_id || '',
                plan_type: pageParams.plan_type || '',
                phone: formData.phone,
                user_id: userId,
                shop_init: formData.shop_initials
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create shop account: ${response.status}`);
        }
        
        return await response.text();
    } catch (error) {
        console.error('Shop account creation error:', error);
        throw new Error('Failed to create shop account');
    }
}

async function loginShop(formData, userId) {
    try {
        const response = await fetch(`${CONFIG.SERVER_BASE_URL}/loginShop`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.BEARER_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                email: formData.email,
                auth0_sub_id: userId
            })
        });
        
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.plan_type || !result.plan_type[0]) {
            throw new Error('Invalid login response - missing shop data');
        }
        
        return result.plan_type[0];
    } catch (error) {
        console.error('Shop login error:', error);
        throw new Error('Failed to complete login');
    }
}

// Main Signup Process
async function handleShopSignup(formData) {
    try {
        setLoadingState(true);
        
        // Step 1: Get Auth0 token
        showSuccess('Getting authentication token...');
        const auth0Token = await getAuth0Token();
        
        // Step 2: Create Auth0 user
        showSuccess('Creating user account...');
        const userId = await createAuth0User(formData, auth0Token);
        
        // Step 3: Create shop account
        showSuccess('Setting up shop account...');
        await createShopAccount(formData, userId);
        
        // Step 4: Login and get shop data
        showSuccess('Completing setup...');
        const shopData = await loginShop(formData, userId);
        
        // Step 5: Store session data
        sessionStorage.setItem('shop_name', shopData.shop_name);
        sessionStorage.setItem('shop_code', shopData.shop_code);
        sessionStorage.setItem('plan_type', shopData.plan_type);
        sessionStorage.setItem('shop_token', shopData.shop_token);
        
        // Step 6: Redirect to dashboard
        showSuccess('Account created successfully! Redirecting...');
        
        setTimeout(() => {
            const dashboardUrl = `./dashboard.html?plan_type=${encodeURIComponent(shopData.plan_type)}&shop_name=${encodeURIComponent(shopData.shop_name)}&shop_code=${encodeURIComponent(shopData.shop_code)}`;
            window.location.replace(dashboardUrl);
        }, 1500);
        
    } catch (error) {
        console.error('Signup process failed:', error);
        showError(error.message || 'An error occurred during account creation. Please try again.');
        setLoadingState(false);
    }
}

// Form Handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = {
        shop_name: elements.inputs.shop_name?.value?.trim() || '',
        email: elements.inputs.email?.value?.trim() || '',
        password: elements.inputs.password?.value || '',
        phone: elements.inputs.phone?.value?.trim() || '',
        shop_initials: elements.inputs.shop_initials?.value?.trim() || ''
    };
    
    // Validate form
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
        showError(validationErrors.join(', '));
        return;
    }
    
    // Process signup
    await handleShopSignup(formData);
}

// Authorization Functions
function checkAuthorization() {
    const hasValidParams = pageParams.sub_id && pageParams.invoice_id && pageParams.plan_type;
    
    if (!hasValidParams) {
        console.log('Authorization failed - missing required parameters:', pageParams);
        showUnauthorizedAccess();
        return false;
    }
    
    console.log('Authorization successful with parameters:', pageParams);
    return true;
}

function showUnauthorizedAccess() {
    const errorMsgDiv = document.getElementById('error_msg');
    const signinBox = document.getElementById('signin_box');
    
    if (errorMsgDiv && signinBox) {
        errorMsgDiv.style.display = 'block';
        signinBox.style.display = 'none';
    }
}

function showAuthorizedAccess() {
    const errorMsgDiv = document.getElementById('error_msg');
    const signinBox = document.getElementById('signin_box');
    
    if (errorMsgDiv && signinBox) {
        errorMsgDiv.style.display = 'none';
        signinBox.style.display = 'block';
    }
}

// Initialization
function initializeSigninForm() {
    // Check authorization first
    if (!checkAuthorization()) {
        return; // Don't initialize form if not authorized
    }
    
    // Show authorized access
    showAuthorizedAccess();
    
    // Get DOM elements
    elements.form = document.getElementById('signin');
    elements.submitBtn = document.querySelector('.signin-btn');
    elements.btnText = document.querySelector('.btn-text');
    elements.btnSpinner = document.querySelector('.btn-spinner');
    elements.errorDiv = document.getElementById('error');
    
    // Get input elements
    elements.inputs.shop_name = document.getElementById('shop_name');
    elements.inputs.email = document.getElementById('email');
    elements.inputs.password = document.getElementById('password');
    elements.inputs.phone = document.getElementById('phone');
    elements.inputs.shop_initials = document.getElementById('shop_initials');
    
    // Add form submit handler
    if (elements.form) {
        elements.form.addEventListener('submit', handleFormSubmit);
    }
    
    // Log successful initialization
    console.log('Shop Signin initialized successfully with params:', pageParams);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSigninForm);
} else {
    initializeSigninForm();
}
