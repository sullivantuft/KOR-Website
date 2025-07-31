
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
    console.log('form has been submitted');
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    var name = document.getElementById("name").value;
    urlencoded.append("name", name); 
    var email = document.getElementById("email").value;
    urlencoded.append("email", email);
    // console.log((document.getElementById("username").value));
    var password = document.getElementById("password").value;
    urlencoded.append("password", password);
    // console.log((document.getElementById("password").value));
    var phone = document.getElementById("phone").value;
    urlencoded.append("phone", phone);
    urlencoded.append("sub_Id", sub_Id);
    urlencoded.append("invoice_Id", invoice_Id);
    urlencoded.append("plan_type", plan_type);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("name", name);
    urlencoded.append("email", email);
    urlencoded.append("password", password);
    urlencoded.append("sub_Id", sub_Id);
    urlencoded.append("invoice_Id", invoice_Id);
    urlencoded.append("plan_type", plan_type);
    urlencoded.append("phone", phone);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://jmrcycling.com:3001/signinPersonal", requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(result => {
        console.log(result);
        
        // Check if signup was successful
        if (result.includes('error') || result.includes('failed')) {
            throw new Error('Account creation failed. Please try again.');
        }
        
        var urlencoded2 = new URLSearchParams();
        urlencoded2.append("email", email);
        urlencoded2.append("password", password);

        var requestOptions2 = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded2,
            redirect: 'follow'
        };

        return fetch("https://jmrcycling.com:3001/loginShop", requestOptions2);
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed after account creation');
        }
        return response.json();
    })
    .then(result => {
        console.log('Login successful:', result);
        
        if (!result.plan_type || !result.plan_type[0]) {
            throw new Error('Invalid account data received');
        }
        
        // Store session data
        sessionStorage.setItem('shop_name', result.plan_type[0].shop_name);
        sessionStorage.setItem('shop_code', result.plan_type[0].shop_code);
        sessionStorage.setItem('plan_type', result.plan_type[0].plan_type);
        sessionStorage.setItem('shop_token', result.plan_type[0].shop_token);
        
        console.log('Session data stored successfully');
        
        // Success! Redirect to QR onboard for automatic app routing
        btnText.textContent = 'Success! Redirecting to app...';
        setTimeout(() => {
            const shopCode = result.plan_type[0].shop_code;
            window.location.replace(`https://jmrcycling.com:3001/qr/onboard/${shopCode}`);
        }, 1000);
    })
    .catch(error => {
        console.error('Signup error:', error);
        setLoadingState(false);
        
        let errorMessage = 'An error occurred during account creation. Please try again.';
        
        if (error.message.includes('Network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('failed')) {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
    });





});
