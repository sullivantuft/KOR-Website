// var token = new URLSearchParams( window.location.search );
// token = token.get('token')

var token = sessionStorage.getItem('token');
console.log(token)

const changePassword = document.getElementById("changePassword");

changePassword.addEventListener("submit", (e) => {
    e.preventDefault();
    var current_password = document.getElementById("currentPassword").value;
    var new_password = document.getElementById("newPassword").value;
    var re_enter_password = document.getElementById("re-enterPassword").value;
    
    if (new_password == re_enter_password) {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer 97f94bee48b8ebf793f0c445c1ade27070625622");
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("current_password", current_password);
        urlencoded.append("new_password", new_password);
        urlencoded.append("token", token);

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
        }
        

        fetch("https://jmrcycling.com:3001/changeShopPassword", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result)
            window.alert("Password changed successfully")
        })
        .catch(error => console.log('error', error));
    }
    else if (new_password != re_enter_password) {
        window.alert("Your new password and re-entered passwords don't match");
    }
    else {
        window.alert("Something went wrong, please try again");
    }
})

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }   
}