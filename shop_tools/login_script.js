let auth0 = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
  
    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId
    });
};

let user_id;
window.onload = async () => {
    await configureClient();

    updateUI();

    const isAuthenticated = await auth0.isAuthenticated();
    console.log(isAuthenticated);
    if (isAuthenticated) {
        // console.log(JSON.stringify(await auth0.getUser()))
        // user_id = JSON.stringify(await auth0.getUser())
        console.log('user is authenticated');
        const user = await auth0.getUser();
        console.log(user.sub);
        const user_sub = user.sub;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("auth0_sub_id", user_sub);

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



        return;
    }
    console.log(isAuthenticated);
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
    console.log(isAuthenticated);
  
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;


    if (isAuthenticated) {
        console.log('user is authenticated');
        const user = await auth0.getUser();
        console.log(user.sub);
        const user_sub = user.sub;
        // 
        // Change code to get shop information before routing to dashboard. Use the same API but route to a new function if there is a sub_id.
        //
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("auth0_sub_id", user_sub);

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
// console.log(isAuthenticated);