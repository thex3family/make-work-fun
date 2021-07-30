self.__WB_DISABLE_DEV_LOGS = true

self.addEventListener('notificationclose', function(e) {
    var notification = e.notification;
    console.log('Closed notification: ');
  });

// listen to message event from window
self.addEventListener('message', event => {
    // HOW TO TEST THIS?
    // Run this in your browser console: 
    //     window.navigator.serviceWorker.controller.postMessage({command: 'log', message: 'hello world'})
    // OR use next-pwa injected workbox object
    //     window.workbox.messageSW({command: 'log', message: 'hello world'})
    console.log(event.data)
  })