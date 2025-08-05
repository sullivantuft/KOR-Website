const send_notif = document.getElementById('send_notif');

console.log(send_notif);
shop_code = sessionStorage.getItem('shop_code');
shop_name = sessionStorage.getItem('shop_name');
plan_type = sessionStorage.getItem('plan_type');
shop_token = sessionStorage.getItem('shop_token');

send_notif.addEventListener('submit', e => {
  e.preventDefault();
  console.log('form has been submitted');

  var myHeaders = new Headers();
  myHeaders.append(
    'Authorization',
    'Bearer 97f94bee48b8ebf793f0c445c1ade27070625622'
  );
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  var urlencoded = new URLSearchParams();
  urlencoded.append('shop_name', shop_name);
  urlencoded.append('shop_token', shop_token);
  var message = document.getElementById('message').value;
  console.log(message);
  urlencoded.append('message', message);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  fetch('https://jmrcycling.com:3001/sendPushNotifications', requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result);
      window.alert('Your messages have been sent!');
    })
    .catch(error => console.log('error', error));
});
