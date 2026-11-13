// expo-service-worker.js

self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nova Notificação', {
      body: data.body || 'Você tem uma nova mensagem.',
      icon: data.icon,
      data: data.data,
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Aqui pode adicionar lógica para abrir a app quando a notificação for clicada
});