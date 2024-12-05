import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Initialize Firebase Authentication and Firestore
const auth = getAuth();
const db = getFirestore();
const submit = document.getElementById("submit-button");

submit.addEventListener("click", async function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById('message');
  const rememberMe = document.getElementById("remember-me").checked;

  // Check if username and password are provided
  if (!username || !password) {
    message.textContent = "Please enter both username and password.";
    return;
  }

  try {
    // Query Firestore to find the email associated with the username
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("username", "==", username));  // Query for username

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      message.textContent = "Invalid username or password.";
      return;
    }

    // Assuming we find exactly one user with the given username
    const userDoc = querySnapshot.docs[0];  // First matching document
    const email = userDoc.data().email;

    // Sign in with the email and password retrieved from Firestore
    // Set persistence mode before signing in
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    setPersistence(auth, persistence)
      .then(() => {
        // Proceed with the existing signInWithEmailAndPassword logic
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            console.log(persistence);
            window.location.href = "/public/dashboard/dashboard.html";
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorMessage.includes("invalid-credential") || errorMessage.includes("user-not-found")) {
              message.textContent = "Invalid username or password.";
            } else {
              message.textContent = "An error occurred. Please try again.";
            }
          });
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
        message.textContent = "An error occurred. Please try again.";
      });

  } catch (error) {
    console.error("Error fetching username: ", error);
    message.textContent = "An error occurred. Please try again.";
  }
});
