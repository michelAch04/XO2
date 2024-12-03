//IMPORTANT: THIS FILE IS USED TO IMPORT FIREBASE MODULES

//---------------------------------------------------------------------------------------------------------//
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";


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


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
