const send_notif = document.getElementById("send_notif");

console.log(send_notif);


send_notif.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log('form has been submitted');
    
});