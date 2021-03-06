self.__WB_DISABLE_DEV_LOGS = true;

self.addEventListener('notificationclick', function (e) {
  var notification = e.notification;
  var action = e.action;
  var win_url = `https://makework.fun/player?utm_source=notification&win_id=${e.notification.data.win_id}`;

  if (action === 'close') {
    notification.close();
    console.log('Closed Notification');
  } else {
    // this code doesn't really work, always the false case.
    e.waitUntil(clients.matchAll({ type: 'window' }).then(clientsArr => {
      // If a Window tab matching the targeted URL already exists, focus that;
      const hadWindowToFocus = clientsArr.some(windowClient => windowClient.url.includes("makework.fun") ? (windowClient.focus(), true) : false);
      // Otherwise, open a new tab to the applicable URL and focus it.
      if (!hadWindowToFocus) clients.openWindow(win_url).then(windowClient => windowClient ? windowClient.focus() : null);
    }));
    // e.waitUntil(
    //   clients
    //     .matchAll({
    //       type: 'window'
    //     })
    //     .then(function (clientList) {
    //       for (var i = 0; i < clientList.length; i++) {
    //         var client = clientList[i];
    //         if (client.url == '/' && 'focus' in client) return client.focus();
    //       }
    //       if (clients.openWindow) {
    //         return clients.openWindow(win_url);
    //       }
    //     })
    // );
    notification.close();
    // e.waitUntil(clients.matchAll({ type: 'window' }).then(clientsArr => {
    //   // If a Window tab matching the targeted URL already exists, focus that;
    //   const hadWindowToFocus = clientsArr.some(windowClient => win_url.includes(windowClient.url) ? (windowClient.focus(), true) : false);
    //   // Otherwise, open a new tab to the applicable URL and focus it.
    //   if (!hadWindowToFocus) clients.openWindow(win_url).then(windowClient => windowClient ? windowClient.focus() : null);
    // }));
    // clients.openWindow(`https://makework.fun/player?utm_source=notification&win_id=${win_id}`);
    // notification.close();
  }
});
