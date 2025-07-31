var sub_Id = new URLSearchParams( window.location.search );
sub_Id = sub_Id.get('sub_id');
console.log(sub_Id);
var invoice_Id = new URLSearchParams( window.location.search );
invoice_Id = invoice_Id.get('invoice_id');
console.log(invoice_Id);
var plan_type = new URLSearchParams( window.location.search );
plan_type = plan_type.get('plan_type');
console.log(plan_type);


const signin = document.getElementById("signin");
const submitBtn = document.querySelector('.signin-btn');
const btnText = document.querySelector('.btn-text');
const btnSpinner = document.querySelector('.btn-spinner');
const errorDiv = document.getElementById('error');

// Auth0 configuration
let auth0Token = null;

// Get Auth0 management token
async function getAuth0Token() {
    try {
        const response = await fetch("https://jmrcycling.com:3001/getauth0Token", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                "access_token": "auth0_token"
            })
        });
        
        const result = await response.text();
        const parsed = JSON.parse(result);
        return parsed.token[0].auth0_token;
    } catch (error) {
        console.error('Error getting Auth0 token:', error);
        throw new Error('Failed to get authentication token');
    }
}

// Create Auth0 user
async function createAuth0User(email, password, name, token) {
    try {
        const response = await fetch("https://dev-oseu3r74.us.auth0.com/api/v2/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${token}`
            },
            body: new URLSearchParams({
                "email": email,
                "password": password,
                "connection": "Username-Password-Authentication",
                "name": name
            })
        });
        
        const result = await response.text();
        const parsed = JSON.parse(result);
        
        if (parsed.error) {
            throw new Error(parsed.message || 'Failed to create Auth0 user');
        }
        
        return parsed.user_id;
    } catch (error) {
        console.error('Error creating Auth0 user:', error);
        throw error;
    }
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9]?[0-9]{7,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.textContent = 'Creating Account...';
        btnSpinner.style.display = 'inline-block';
        submitBtn.classList.add('btn-loading');
    } else {
        submitBtn.disabled = false;
        btnText.textContent = 'Create Account';
        btnSpinner.style.display = 'none';
        submitBtn.classList.remove('btn-loading');
    }
}

// Real-time validation
function addInputValidation() {
    const inputs = document.querySelectorAll('.input-group input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            const inputGroup = this.closest('.input-group');
            const value = this.value.trim();
            
            // Remove previous validation classes
            inputGroup.classList.remove('error', 'success');
            
            if (value) {
                let isValid = true;
                
                if (this.type === 'email') {
                    isValid = validateEmail(value);
                } else if (this.type === 'tel') {
                    isValid = validatePhone(value);
                } else if (this.type === 'password') {
                    isValid = value.length >= 8;
                }
                
                if (isValid) {
                    inputGroup.classList.add('success');
                } else {
                    inputGroup.classList.add('error');
                }
            }
        });
    });
}

// Initialize validation
addInputValidation();

signin.addEventListener("submit", (e) => {
    e.preventDefault();
    
    (async () => {
        try {
            // Clear any previous errors
            errorDiv.style.display = 'none';
            
            // Get form values
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const phone = document.getElementById("phone").value.trim();
            
            // Validate form
            if (!name) {
                showError('Please enter your full name');
                return;
            }
            
            if (!validateEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            if (password.length < 8) {
                showError('Password must be at least 8 characters long');
                return;
            }
            
            if (!validatePhone(phone)) {
                showError('Please enter a valid phone number');
                return;
            }
            
            setLoadingState(true);
            console.log('Personal user signup initiated with Auth0');

            // Step 1: Get Auth0 token
            btnText.textContent = 'Setting up authentication...';
            auth0Token = await getAuth0Token();
            
            // Step 2: Create Auth0 user
            btnText.textContent = 'Creating secure account...';
            const userId = await createAuth0User(email, password, name, auth0Token);
            console.log('Auth0 user created:', userId);
            
            // Step 3: Create personal account on the server
            btnText.textContent = 'Finalizing account setup...';
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            
            const urlencoded = new URLSearchParams();
            urlencoded.append("name", name);
            urlencoded.append("email", email);
            urlencoded.append("password", password);
            urlencoded.append("sub_Id", sub_Id);
            urlencoded.append("invoice_Id", invoice_Id);
            urlencoded.append("plan_type", plan_type);
            urlencoded.append("phone", phone);
            urlencoded.append("user_id", userId); // Auth0 user ID

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'
            };

            const response = await fetch("https://jmrcycling.com:3001/signinPersonal", requestOptions);
            
            if (!response.ok) {
                throw new Error('Server error during account creation');
            }
            
            const result = await response.text();
            console.log('Personal account created:', result);
            
            // Check if signup was successful
            if (result.includes('error') || result.includes('failed')) {
                throw new Error('Account creation failed. Please try again.');
            }
            
            // Step 4: Login to get session data
            btnText.textContent = 'Logging you in...';
            const urlencoded2 = new URLSearchParams();
            urlencoded2.append("email", email);
            urlencoded2.append("auth0_sub_id", userId); // Use Auth0 user ID for login

            const requestOptions2 = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded2,
                redirect: 'follow'
            };

            const loginResponse = await fetch("https://jmrcycling.com:3001/loginShop", requestOptions2);
            
            if (!loginResponse.ok) {
                throw new Error('Login failed after account creation');
            }
            
            const loginResult = await loginResponse.json();
            console.log('Login successful:', loginResult);
            
            if (!loginResult.plan_type || !loginResult.plan_type[0]) {
                throw new Error('Invalid account data received');
            }
            
            // Store session data
            sessionStorage.setItem('shop_name', loginResult.plan_type[0].shop_name || name);
            sessionStorage.setItem('shop_code', loginResult.plan_type[0].shop_code);
            sessionStorage.setItem('plan_type', loginResult.plan_type[0].plan_type);
            sessionStorage.setItem('shop_token', loginResult.plan_type[0].shop_token);
            sessionStorage.setItem('user_id', userId); // Store Auth0 user ID
            
            console.log('Session data stored successfully');
            
            // Success! Redirect to QR onboard for automatic app routing
            btnText.textContent = 'Success! Redirecting to app...';
            setTimeout(() => {
                const shopCode = loginResult.plan_type[0].shop_code;
                window.location.replace(`https://jmrcycling.com:3001/qr/onboard/${shopCode}`);
            }, 1000);
            
        } catch (error) {
            console.error('Personal signup error:', error);
            setLoadingState(false);
            
            let errorMessage = 'An error occurred during account creation. Please try again.';
            
            if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('Failed to create Auth0 user')) {
                errorMessage = 'Account creation failed. Email may already be in use.';
            } else if (error.message.includes('failed')) {
                errorMessage = error.message;
            }
            
            showError(errorMessage);
        }
    })();
});
