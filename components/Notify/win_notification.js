

export default async function notifyMe(type, details) {
  function sendNotification(title, options) {
    let link = 'https://makework.fun/player';

    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
    //   var notification = new Notification(title, options);
    //   notification.onclick = function (event) {
    //     event.preventDefault(); // prevent the browser from focusing the Notification's tab
    //     window.open(link, '_blank');
    //   };

    //   setTimeout(notification.close.bind(notification), 7000);
        
    navigator.serviceWorker.getRegistration().then(function(reg) {
        if(reg) {reg.showNotification(title, options);
        }else{
          console.log('Registration missing')
        }
      });

}

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === 'granted') {
            navigator.serviceWorker.getRegistration().then(function(reg) {
              if(reg) {reg.showNotification(title, options);
            }else{
              console.log('Registration missing')
            }
              });
        }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

    
  let img = '/img/co-x3logo_white.png';

  if (type == 'win') {
    let title = "🎉 You've completed a " + details.toUpperCase() + '!';
    let text = "Keep up the good work!";
    let vibe = [200, 100, 200];
    var options = {
      body: text,
      icon: img,
      badge: img,
      vibrate: vibe,
      tag: type,
      renotify: true,
    //   data: {
    //     dateOfArrival: Date.now(),
    //     primaryKey: 1
    //   },
    };
    sendNotification(title, options);
  } else if (type == 'level') {
    let title = "🌟 You've leveled up to " + details + '!';
    let text = "It's time to celebrate!";
    let vibe = [400];
    var options = {
      body: text,
      icon: img,
      badge: img,
      vibrate: vibe,
      tag: type,
      renotify: true,
    //   data: {
    //     dateOfArrival: Date.now(),
    //     primaryKey: 1
    //   },
      actions: [
        {action: 'explore', title: 'View Player'},
        {action: 'close', title: 'Dismiss'},
      ]
    };
    sendNotification(title, options);
  }
}
