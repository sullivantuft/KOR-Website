const login = document.getElementById("login");
const loginErrorMsg = document.getElementById("login-error-msg");

// console.log(login)

login.addEventListener("submit", (e) => {
    e.preventDefault();

    console.log('form has been submitted');
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    var email = document.getElementById("email").value;
    urlencoded.append("email", email);
    var password = document.getElementById("password").value;
    urlencoded.append("password", password);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://jmrcycling.com:3001/loginShop", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(('plan type ' + result.plan_type[0].plan_type));
            console.log(('shop_name ' + result.plan_type[0].shop_name));
            console.log(('shop token ' + result.plan_type[0].shop_token));

            // set the session storage
            sessionStorage.setItem('shop_name', result.plan_type[0].shop_name);
            
            sessionStorage.setItem('shop_code', result.plan_type[0].shop_code);
            sessionStorage.setItem('plan_type', result.plan_type[0].plan_type);
            sessionStorage.setItem('shop_token', result.plan_type[0]. shop_token)
            console.log(sessionStorage.getItem('shop_name'));
            console.log(sessionStorage.getItem('shop_code'));
            console.log(sessionStorage.getItem('plan_type'));
            console.log(sessionStorage.getItem('shop_token'));
            window.location.replace("./dashboard.html?plan_type=" + result.plan_type[0].plan_type + "&shop_name=" + result.plan_type[0].shop_name + "&shop_code=" + result.plan_type[0].shop_code);
            
        })
        .catch(error => {
            console.log('error', error);
            // window.alert('Your email or password may be incorrect');
            loginErrorMsg.style.opacity = 1;
        });

})