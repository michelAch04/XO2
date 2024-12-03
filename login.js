import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth();
const submit = document.getElementById("submit-button");

submit.addEventListener("click", function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      alert("logging in..");
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode, errorMessage);
      // ..
    });
});

const forgotPass = document.getElementById("reset");
forgotPass.addEventListener("click", function(event){
  event.preventDefault();
  const email = document.getElementById("email").value;
})