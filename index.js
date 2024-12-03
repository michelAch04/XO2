//IMPORTANT: THIS FILE IS USED TO IMPORT FIREBASE MODULES

//---------------------------------------------------------------------------------------------------------//
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";


// https://firebase.google.com/docs/web/setup#available-libraries

//Config
const firebaseConfig = {
  apiKey: "AIzaSyDFegfGCwKKR9zd5efQoR7cal5FTyJVg0I",
  authDomain: "xosquared-c1ab2.firebaseapp.com",
  projectId: "xosquared-c1ab2",
  storageBucket: "xosquared-c1ab2.firebasestorage.app",
  messagingSenderId: "383412884400",
  appId: "1:383412884400:web:ba8ea19966c67e0b93fc75",
  measurementId: "G-FL4ZKEP2HF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

