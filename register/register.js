import { getAuth, updateProfile, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth();
const submit = document.getElementById("submit-button");

submit.addEventListener("click", function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm").value;
  const message = document.getElementById("message");

  if (!username || !email || !password || !confirmPassword) {
    message.textContent = "All fields are required.";
    return;
  }

  if(confirmPassword !== password){
    message.textContent = "Passwords do not match.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;

      updateProfile(auth.currentUser, {
        displayName: username
      }).then(() => {
        // Profile updated!
        alert(`Welcome, ${auth.currentUser.displayName}!`);
        // ...
      }).catch((error) => {
        // An error occurred
        alert(error.message);
        // ...
      });

      const loginContainer = document.querySelector('.login-container');
      loginContainer.style.display = "none";
      const successMsg = document.getElementById('success-message');
      successMsg.style.display = "flex";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
});