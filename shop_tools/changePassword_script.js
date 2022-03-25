var token = new URLSearchParams( window.location.search );
token = token.get('token')
console.log(token)

const changePassword = document.getElementById("changePassword");

changePassword.addEventListener("submit", (e) => {
    e.preventDefault();
    
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