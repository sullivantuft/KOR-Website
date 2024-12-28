const query = window.location.search;
if (!(query.includes("sub_id=") && query.includes("invoice_id=") && query.includes("plan_type="))) {
// Development query ?sub_id=test&invoice_id=test&plan_type=basic
    var x = document.getElementById("signin_box");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
    var y = document.getElementById("error_msg");
    if (y.style.display === "none") {
        y.style.display = "block";
    } else {
        y.style.display = "none";
    }


    // Use replaceState to redirect the user away and remove the querystring parameters
    // window.history.replaceState({}, document.title, "/shop_tools/login.html");
}


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


signin.addEventListener("submit", (e) => {
    e.preventDefault();


    console.log('form has been submitted');
    // variables from form
    var shop_name = document.getElementById("shop_name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var phone = document.getElementById("phone").value;
    var shop_init = document.getElementById("shop_initials").value;

    // auth0 token call
    var auth0Headers = new Headers();
    auth0Headers.append("Content-Type", "application/x-www-form-urlencoded");

    var auth0urlencoded = new URLSearchParams();
    auth0urlencoded.append("access_token", "auth0_token");

    var requestOptions = {
    method: 'POST',
    headers: auth0Headers,
    body: auth0urlencoded,
    redirect: 'follow'
    };
    let auth0_token;
    fetch("https://jmrcycling.com:3001/getauth0Token", requestOptions)
    .then(response => response.text())
    .then(result => {
        console.log(result);
        // console.log(JSON.parse(result));
        result = JSON.parse(result)
        console.log(result.token[0].auth0_token)
        auth0_token = result.token[0].auth0_token;
        // Dev code
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", "Bearer " + auth0_token);
        myHeaders.append("Cookie", "did=s%3Av0%3A18447825-b02f-4979-a834-64659d118b10.2%2F73BuZf6zLVVPTx5t20Dh4Ud9OSjJp9KQNsPMgGKV4; did_compat=s%3Av0%3A18447825-b02f-4979-a834-64659d118b10.2%2F73BuZf6zLVVPTx5t20Dh4Ud9OSjJp9KQNsPMgGKV4");

        const urlencoded = new URLSearchParams();
        urlencoded.append("email", email);
        urlencoded.append("password", password);
        urlencoded.append("connection", "Username-Password-Authentication");
        urlencoded.append("name", shop_name);

        const requestOptions2 = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
        };

        fetch("https://dev-oseu3r74.us.auth0.com/api/v2/users", requestOptions2)
            .then((response) => response.text())
            .then((result) => {
                console.log(result);
                result = JSON.parse(result);
                let user_id = result.user_id;
                console.log(user_id);
                var myHeaders = new Headers();
                myHeaders.append("Authorization", "Bearer 97f94bee48b8ebf793f0c445c1ade27070625622");
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                var urlencoded = new URLSearchParams();
                urlencoded.append("shop_name", shop_name);
                urlencoded.append("email", email);
                urlencoded.append("sub_Id", sub_Id);
                urlencoded.append("invoice_Id", invoice_Id);
                urlencoded.append("plan_type", plan_type);
                urlencoded.append("phone", phone);
                urlencoded.append("user_id", user_id);
                urlencoded.append("shop_init", shop_init);

                var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'
                };

                fetch("https://jmrcycling.com:3001/signinShop", requestOptions)
                .then(response => response.text())
                .then(result => {
                    console.log(result);
                    var urlencoded2 = new URLSearchParams();
                    urlencoded2.append("email", email)
                    urlencoded2.append("auth0_sub_id", user_id)

                    var requestOptions2 = {
                        method: 'POST',
                        headers: myHeaders,
                        body: urlencoded2,
                        redirect: 'follow'
                    };
                    fetch("https://jmrcycling.com:3001/loginShop", requestOptions2)
                            .then(response => response.json())
                            .then(result => {
                                console.log(('plan type ' + result.plan_type[0].plan_type));
                                console.log(('shop_name ' + result.plan_type[0].shop_name));

                                sessionStorage.setItem('shop_name', result.plan_type[0].shop_name);

                                sessionStorage.setItem('shop_code', result.plan_type[0].shop_code);
                                sessionStorage.setItem('plan_type', result.plan_type[0].plan_type);
                                sessionStorage.setItem('shop_token', result.plan_type[0]. shop_token)
                                console.log(sessionStorage.getItem('shop_name'));
                                console.log(sessionStorage.getItem('shop_code'));
                                console.log(sessionStorage.getItem('plan_type'));
                                console.log(sessionStorage.getItem('shop_token'));
                                
                                window.location.replace("./dashboard.html?plan_type=" + result.plan_type[0].plan_type + "&shop_name=" + result.plan_type[0].shop_name);
                            })
                            .catch(error => console.log('error', error));
                })
                .catch(error => console.log('error', error));

                        

            })
            .catch((error) => console.error(error));

        // call create user auth0 API call
        // var createUserHeaders = new Headers();
        // createUserHeaders.append("Authorization", "Bearer " + auth0_token);
        // createUserHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        // var createUserUrlencoded = new URLSearchParams();
        // createUserUrlencoded.append("email", email);
        // createUserUrlencoded.append("password", password);
        // createUserUrlencoded.append("connection", "Username-Password-Authentication");
        // createUserUrlencoded.append("name", shop_name);

        // var requestOptions = {
        //     method: 'POST',
        //     headers: createUserHeaders,
        //     body: createUserUrlencoded,
        //     redirect: 'follow'
        //   };
          
        //   fetch("https://dev-oseu3r74.us.auth0.com/api/v2/users", requestOptions)
        //     .then(response => response.text())
            // .then(result => {
            //     console.log(result);
            //     result = JSON.parse(result);
            //     let user_id = result.user_id;
            //     console.log(user_id);
            //     var myHeaders = new Headers();
            //     myHeaders.append("Authorization", "Bearer 97f94bee48b8ebf793f0c445c1ade27070625622");
            //     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            //     var urlencoded = new URLSearchParams();
            //     urlencoded.append("shop_name", shop_name);
            //     urlencoded.append("email", email);
            //     urlencoded.append("sub_Id", sub_Id);
            //     urlencoded.append("invoice_Id", invoice_Id);
            //     urlencoded.append("plan_type", plan_type);
            //     urlencoded.append("phone", phone);
            //     urlencoded.append("user_id", user_id);

            //     var requestOptions = {
            //     method: 'POST',
            //     headers: myHeaders,
            //     body: urlencoded,
            //     redirect: 'follow'
            //     };

            //     fetch("https://jmrcycling.com:3001/signinShop", requestOptions)
            //     .then(response => response.text())
            //     .then(result => {
            //         console.log(result);
            //         var urlencoded2 = new URLSearchParams();
            //         urlencoded2.append("email", email)
            //         urlencoded2.append("auth0_sub_id", user_id)

            //         var requestOptions2 = {
            //             method: 'POST',
            //             headers: myHeaders,
            //             body: urlencoded2,
            //             redirect: 'follow'
            //         };
            //         fetch("https://jmrcycling.com:3001/loginShop", requestOptions2)
            //                 .then(response => response.json())
            //                 .then(result => {
            //                     console.log(('plan type ' + result.plan_type[0].plan_type));
            //                     console.log(('shop_name ' + result.plan_type[0].shop_name));

            //                     sessionStorage.setItem('shop_name', result.plan_type[0].shop_name);

            //                     sessionStorage.setItem('shop_code', result.plan_type[0].shop_code);
            //                     sessionStorage.setItem('plan_type', result.plan_type[0].plan_type);
            //                     sessionStorage.setItem('shop_token', result.plan_type[0]. shop_token)
            //                     console.log(sessionStorage.getItem('shop_name'));
            //                     console.log(sessionStorage.getItem('shop_code'));
            //                     console.log(sessionStorage.getItem('plan_type'));
            //                     console.log(sessionStorage.getItem('shop_token'));
                                
            //                     window.location.replace("./dashboard.html?plan_type=" + result.plan_type[0].plan_type + "&shop_name=" + result.plan_type[0].shop_name);
            //                 })
            //                 .catch(error => console.log('error', error));
            //     })
            //     .catch(error => console.log('error', error));

                        

            // })
            // .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));

});