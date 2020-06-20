
importScripts('https://www.gstatic.com/firebasejs/7.14.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.4/firebase-messaging.js');
importScripts("/service-worker.js")

firebase.initializeApp({
  apiKey: "AIzaSyDSy7KvNgPa42c8aiILI6o7jknMCq72Saw",
  authDomain: "bpim-d5971.firebaseapp.com",
  databaseURL: "https://bpim-d5971.firebaseio.com",
  projectId: "bpim-d5971",
  storageBucket: "bpim-d5971.appspot.com",
  messagingSenderId: "263404475070",
  appId: "1:263404475070:web:74212b489a5cfdb66904ef",
  measurementId: "G-1RBYE73RY5"
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

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});
