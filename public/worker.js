self.__WB_DISABLE_DEV_LOGS = true;

self.addEventListener('notificationclick', function (e) {
  var notification = e.notification;
  var action = e.action;
  var location = `player?utm_source=notification&win_id=${e.notification.data.win_id}`;

  if (action === 'close') {
    e.notification.close();
    console.log('Closed Notification');
  } else {
    //For root applications: just change "'./'" to "'/'"
    //Very important having the last forward slash on "new URL('./', location)..."
    const rootUrl = new URL('./', location).href;
    e.notification.close();
    e.waitUntil(
      clients.matchAll().then((matchedClients) => {
        for (let client of matchedClients) {
          if (client.url.indexOf(rootUrl) >= 0) {
            return client.focus();
          }
        }

        return clients.openWindow(rootUrl).then(function (client) {
          client.focus();
        });
      })
    );
    // e.waitUntil(clients.matchAll({ type: 'window' }).then(clientsArr => {
    //   // If a Window tab matching the targeted URL already exists, focus that;
    //   const hadWindowToFocus = clientsArr.some(windowClient => win_url.includes(windowClient.url) ? (windowClient.focus(), true) : false);
    //   // Otherwise, open a new tab to the applicable URL and focus it.
    //   if (!hadWindowToFocus) clients.openWindow(win_url).then(windowClient => windowClient ? windowClient.focus() : null);
    // }));
    // clients.openWindow(`https://makework.fun/player?utm_source=notification&win_id=${win_id}`);
    notification.close();
  }
});
