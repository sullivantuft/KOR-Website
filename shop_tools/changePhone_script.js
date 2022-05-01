const changePhone = document.getElementById("changePhone");

var token = sessionStorage.getItem('token');

changePhone.addEventListener("submit", (e) => {
    e.preventDefault();

    var current_phone = document.getElementById("currentPassword");
    var new_phone = document.getElementById("newPhone");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("current_phone", current_phone);
    urlencoded.append("new_phone", new_phone);
    urlencoded.append("token", token);

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
    };

    fetch("https://www.jmrcycling.com:3001/changeShopPhone", requestOptions)
    .then(response => response.text())
    .then(result => {
        console.log(result);
        window.alert("Your phone number has been sucessfully changed!");

    })
    .catch(error => console.log('error', error));

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