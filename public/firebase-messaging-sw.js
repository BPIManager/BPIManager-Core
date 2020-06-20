// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.14.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.4/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
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
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
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
