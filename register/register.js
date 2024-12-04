import { getAuth, updateProfile, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Initialize Firebase Authentication and Firestore
const auth = getAuth();
const db = getFirestore();
const submit = document.getElementById("submit-button");

submit.addEventListener("click", async function (event) {
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

  if (/[^a-zA-Z0-9]/.test(username) || /^[^a-zA-Z]/.test(username)) {
    const usernameMsg = document.getElementById('username-message');
    usernameMsg.textContent = "Username does not match the required format.";
    window.location.href = "#login-form";
    return;
  }

  if (confirmPassword !== password) {
    const confirmMessage = document.getElementById('confirm-message');
    confirmMessage.textContent = "Passwords do not match.";
    window.location.href = "#login-form";
    return;
  }

  try {
    // Check if the username already exists in Firestore
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const usernameMsg = document.getElementById('username-message');
      usernameMsg.textContent = "Username is already taken. Please choose a different one.";
      window.location.href = "#login-form";
      return;
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(auth.currentUser, {
      displayName: username,
    });

    // Save user info to Firestore
    const userDoc = {
      username: username,
      email: email,
      lastLogin: serverTimestamp(), // Firestore server timestamp
      rating: 100,
    };

    await setDoc(doc(db, "Users", user.uid), userDoc);

    // Display success message
    const loginContainer = document.querySelector('.login-container');
    loginContainer.style.display = "none";
    const successMsg = document.getElementById('success-message');
    successMsg.style.display = "flex";

    setTimeout(() => {
      window.location.href = "/login/login.html";
    }, 3000);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;

    if (errorMessage.includes('email-already-in-use')) {
      const emailMessage = document.getElementById('email-message');
      emailMessage.textContent = "This email is associated with another account!";
      window.location.href = "#login-form";
    } else if (errorMessage.includes("password-does-not-meet-requirements")) {
      const confirmMessage = document.getElementById('confirm-message');
      confirmMessage.textContent = "Password does not meet the requirements.";
      window.location.href = "#login-form";
    } else {
      alert(`Error: ${errorMessage}`);
    }
  }
});
