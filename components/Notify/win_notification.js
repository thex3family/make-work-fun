export default function notifyMe(type, details) {
  function sendNotification(title, options) {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      var notification = new Notification(title, options);
      notification.onclick = function (event) {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.open(link, '_blank');
      };

      setTimeout(notification.close.bind(notification), 7000);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === 'granted') {
          var notification = new Notification(title, options);
          notification.onclick = function (event) {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.open(link, '_blank');
          };
        }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

  let img = '../co-x3logo_white_full.svg';
  let link = 'https://makework.fun/player';

  if (type == 'win') {
    let title = "🎉 You've completed a " + details + '!';
    let text = "It's time to celebrate! Open your gift.";
    let vibe = [200, 100, 200];
    var options = {
      body: text,
      icon: img,
      badge: img,
      image: img,
      vibrate: vibe
    };
    sendNotification(title, options);
  } else if (type == 'level') {
    let title = "🌟 You've leveled up to " + details + '!';
    let text = "It's time to celebrate! Check out your progress.";
    let vibe = [400];
    var options = {
      body: text,
      icon: img,
      badge: img,
      image: img,
      vibrate: vibe
    };
    sendNotification(title, options);
  }
}
