self.__WB_DISABLE_DEV_LOGS = true

self.addEventListener('notificationclick', function(e) {
    var notification = e.notification;
    var action = e.action;
  
    if (action === 'close') {
      notification.close();
      console.log('Closed Notification')
    } else {
      clients.openWindow('https://makework.fun/player');
      notification.close();
    }
  });