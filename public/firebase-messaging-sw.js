
importScripts('https://www.gstatic.com/firebasejs/7.14.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.4/firebase-messaging.js');

if (firebase.messaging.isSupported()) {
  console.log("FCM Available, service-worker is enabled.")
  firebase.initializeApp({
    apiKey: "AIzaSyAIlzzxI0kZtIe4vvjSIiRwfqSQVZtbluM",
    authDomain: "bpimv2.firebaseapp.com",
    projectId: "bpimv2",
    storageBucket: "bpimv2.appspot.com",
    messagingSenderId: "199747072203",
    appId: "1:199747072203:web:79b7545a4e426763b5ab4e",
    measurementId: "G-4V5QE3YXF9"
  });
  const messaging = firebase.messaging();

  messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[FCMv1] Received background message ', payload);
    const notificationOptions = {
      body:payload.data.body,
      icon: payload.data.icon,
      data:{
        url:payload.data.click_action
      }
    };
    self.registration.showNotification(payload.data.title,notificationOptions)
  });

  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  })

}
