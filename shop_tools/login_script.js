// const login = document.getElementById("login");
const loginErrorMsg = document.getElementById("login-error-msg");

// console.log(login)

// login.addEventListener("submit", (e) => {
//     e.preventDefault();

//     console.log('form has been submitted');
//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

//     var urlencoded = new URLSearchParams();
//     var email = document.getElementById("email").value;
//     urlencoded.append("email", email);
//     var password = document.getElementById("password").value;
//     urlencoded.append("password", password);

//     var requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: urlencoded,
//         redirect: 'follow'
//     };

//     fetch("https://jmrcycling.com:3001/loginShop", requestOptions)
//         .then(response => response.json())
//         .then(result => {
//             console.log(('plan type ' + result.plan_type[0].plan_type));
//             console.log(('shop_name ' + result.plan_type[0].shop_name));
//             console.log(('shop token ' + result.plan_type[0].shop_token));

//             // set the session storage
//             sessionStorage.setItem('shop_name', result.plan_type[0].shop_name);
            
//             sessionStorage.setItem('shop_code', result.plan_type[0].shop_code);
//             sessionStorage.setItem('plan_type', result.plan_type[0].plan_type);
//             sessionStorage.setItem('shop_token', result.plan_type[0]. shop_token)
//             console.log(sessionStorage.getItem('shop_name'));
//             console.log(sessionStorage.getItem('shop_code'));
//             console.log(sessionStorage.getItem('plan_type'));
//             console.log(sessionStorage.getItem('shop_token'));
//             window.location.replace("./dashboard.html?plan_type=" + result.plan_type[0].plan_type + "&shop_name=" + result.plan_type[0].shop_name + "&shop_code=" + result.plan_type[0].shop_code);
            
//         })
//         .catch(error => {
//             console.log('error', error);
//             // window.alert('Your email or password may be incorrect');
//             loginErrorMsg.style.opacity = 1;
//         });

// })

// import jose from 'jose';


let auth0 = null;
// ..

const fetchAuthConfig = () => fetch("/auth_config.json");
// ..

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
  
    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId
    });
};
// ..
let user_id;
window.onload = async () => {
    await configureClient();

    updateUI();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        // show the gated content
        console.log(JSON.stringify(await auth0.getUser()))
        user_id = JSON.stringify(await auth0.getUser())
        return;
    }

    // NEW - check for the code and state parameters
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {

        // Process the login state
        await auth0.handleRedirectCallback();
        
        updateUI();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/shop_tools/login.html");
    }
}

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
  
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;

    // NEW - add logic to show/hide gated content after authentication
    if (isAuthenticated) {
        // document.getElementById("gated-content").classList.remove("hidden");
        const user = await auth0.getUser();
        // user = JSON.stringify(user, null, 2);
        console.log(user.sub);
        const user_sub = user.sub;
        // document.getElementById(
        // "ipt-access-token"
        // ).innerHTML = await auth0.getTokenSilently();

        // document.getElementById("ipt-user-profile").textContent = JSON.stringify(
        // await auth0.getUser()
        // );
        window.location.replace("./dashboard.html?sub_id=" + user_sub);
        

    } else {
        // document.getElementById("gated-content").classList.add("hidden");
    }
};

const login = async () => {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin + '/shop_tools/login.html'
    });
};

const logout = () => {
    auth0.logout({
      returnTo: window.location.origin
    });
};