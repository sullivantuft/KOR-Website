
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
    .then(response => response.text())
    .then(result => {
        console.log(result)
        var urlencoded2 = new URLSearchParams();
            urlencoded2.append("email", email)
            urlencoded2.append("password", password)

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
                    
                    window.location.replace("./personal_dashboard.html?plan_type=" + result.plan_type[0].plan_type + "&shop_name=" + result.plan_type[0].shop_name);
                })
                .catch(error => console.log('error', error));
    })
    .catch(error => console.log('error', error));





});
