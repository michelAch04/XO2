import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

//----------------------------------------EXPIRED LOGIN-----------------------------------------
const auth = getAuth();
const db = getFirestore();
let logoutTimer;

// Check if the user is authenticated
function checkAuthStatus() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);
            const profileIcon = document.getElementById('profileIcon');
            profileIcon.innerHTML = user.displayName[0].toUpperCase() + user.displayName[1].toUpperCase();

            //for profile modal
            const usernameInput = document.getElementById('username');
            const initialsInput = document.getElementById('initials');
            usernameInput.value = user.displayName;
            initialsInput.value = user.displayName[0].toUpperCase() + user.displayName[1].toUpperCase();
            // If the session is non-persistent, set up the inactivity logout timer
            if (!isPersistentLogin(user)) {
                setupInactivityLogout();
            }
        } else {
            alert("Session expired. Please log in again.");
            window.location.href = "/login/login.html";
        }
    });
}

// Determine if the session is persistent (from "Remember Me")
function isPersistentLogin(user) {
    // Firebase does not provide a direct method to check persistence,
    // but if user data is still present after browser closure, it's likely persistent.
    return localStorage.getItem('firebase:authUser') !== null;
}

// Set up a 20-minute inactivity timeout
function setupInactivityLogout() {
    resetLogoutTimer();

    ['click', 'mousemove', 'keypress'].forEach((event) => {
        window.addEventListener(event, resetLogoutTimer);
    });
}

function resetLogoutTimer() {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        alert("You have been logged out due to inactivity.");
        signOut(auth).then(() => {
            window.location.href = "/login/login.html";
        }).catch(console.error);
    }, 20 * 60 * 1000); // 20 minutes
}

checkAuthStatus();

//function to logout
function logout() {
    signOut(auth)
        .then(() => {
            localStorage.clear(); // Clear all locally stored data
            sessionStorage.clear(); // Clear session storage
            window.location.href = "/login/login.html";
        })
        .catch((error) => {
            // Handle errors during sign-out
            console.error("Error during logout:", error);
            alert("An error occurred while logging out. Please try again.");
        });
}

// Function to check if username exists in the database
async function isUsernameTaken(username) {
    const usersRef = collection(db, "Users"); // Adjust collection name based on your structure
    const q = query(usersRef, where("username", "==", username));

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if username exists
}

// Function to change user credentials
async function changeCredentials(username, initials) {
    const user = auth.currentUser;

    if (initials) {
        document.getElementById('profileIcon').innerHTML = initials.toUpperCase();
    }

    if (!user) {
        console.error("No authenticated user found.");
        alert("Please log in to update your credentials.");
        return;
    }

    try {
        // Check if username is taken
        if (username === user.displayName) {
            return;
        }
        if (username) {
            const usernameExists = await isUsernameTaken(username);
            if (usernameExists) {
                alert("Username is already taken. Please choose a different one.");
                return;
            }
        }
        // Update display name (username) if provided
        if (username) {
            await updateProfile(user, { displayName: username });
            console.log("Username updated successfully.");
        }

        alert("Credentials updated successfully.");
    } catch (error) {
        console.error("Error updating credentials:", error);
        alert(`Failed to update credentials: ${error.message}`);
    }
}


//---------------------------------------------MODALS-------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profileIcon');
    const settingsIcon = document.getElementById('settingsIcon');
    const logoutIcon = document.getElementById('logoutIcon');

    const profileModal = document.getElementById('profileModal');
    const settingsModal = document.getElementById('settingsModal');
    const logoutModal = document.getElementById('logoutModal');

    const closeProfileModal = document.getElementById('closeProfileModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const closeLogoutModal = document.getElementById('closeLogoutModal');

    function openModal(modal) {
        modal.classList.add('show');
    }

    function closeModal(modal) {
        modal.classList.remove('show');
    }

    //to open and close modals
    profileIcon.addEventListener('click', () => openModal(profileModal));
    settingsIcon.addEventListener('click', () => openModal(settingsModal));
    logoutIcon.addEventListener('click', () => openModal(logoutModal));

    //reset inputs after profile modal close
    closeProfileModal.addEventListener('click', () => {
        usernameInput.setAttribute('disabled', 'true');
        initialsInput.setAttribute('disabled', 'true');
        closeModal(profileModal);
    });
    closeSettingsModal.addEventListener('click', () => closeModal(settingsModal));
    closeLogoutModal.addEventListener('click', () => closeModal(logoutModal));

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === profileModal) closeModal(profileModal);
        if (event.target === settingsModal) closeModal(settingsModal);
        if (event.target === logoutModal) closeModal(logoutModal);
    });

    //cancel buttons
    const closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(closeBtn => {
        if (closeBtn.id.includes('Profile'))
            closeBtn.addEventListener('click', () => {
                usernameInput.setAttribute('disabled', 'true');
                initialsInput.setAttribute('disabled', 'true');
                closeModal(profileModal);
            });
        else if (closeBtn.id.includes('Settings'))
            closeBtn.addEventListener('click', () => closeModal(settingsModal));
        else if (closeBtn.id.includes('Logout'))
            closeBtn.addEventListener('click', () => closeModal(logoutModal));
    });

    //for logout modal
    const acceptLogout = document.getElementById('acceptLogout');
    acceptLogout.addEventListener('click', () => logout());

    //for profile modal
    const usernameInput = document.getElementById('username');
    const initialsInput = document.getElementById('initials');
    //edit username
    document.getElementById('editUsername').addEventListener('click',
        () => usernameInput.removeAttribute('disabled'));
    //edit initials
    document.getElementById('editInitials').addEventListener('click',
        () => initialsInput.removeAttribute('disabled'));
    //save changes
    document.getElementById('saveProfile').addEventListener('click', () => {
        changeCredentials(usernameInput.value.trim(), initialsInput.value.trim());
        usernameInput.setAttribute('disabled', 'true');
        initialsInput.setAttribute('disabled', 'true');
        closeModal(profileModal);
    });
});

//--------------------------------------------DYNAMIC LEADERBOARD-------------------
async function getAllUsernamesAndRatings() {
    const usersCollection = collection(db, "Users");

    try {
        const querySnapshot = await getDocs(usersCollection);
        const userData = [];

        querySnapshot.forEach((doc) => {
            const { username, rating } = doc.data();
            if (username && rating !== undefined) { // Ensure both fields exist
                userData.push({ username, rating });
            }
        });

        console.log("Usernames and Ratings:", userData);
        return userData;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

async function loadLeaderboard() {
    const userListContainer = document.getElementById('players');
    const loadingScreen = document.getElementById('loadingScreen');

    try {
        // Fetch leaderboard data
        const users = await getAllUsernamesAndRatings();

        // Sort users by rating in descending order
        users.sort((a, b) => b.rating - a.rating);

        // Populate the ordered list
        users.forEach((user) => {
            const listItem = document.createElement('li');
            listItem.classList.add("user");
            if (auth.currentUser.displayName === user.username) {
                listItem.id = "own-username";
                listItem.innerHTML = `<span class="username">${user.username}</span>
                <span class="rating">${user.rating}</span>`;
            }
            else {
                listItem.innerHTML = `<span class="username">${user.username}</span>
                <span class="rating">${user.rating}</span>`;
            }
            userListContainer.appendChild(listItem);
        });

        // Hide the loading screen and display the leaderboard
        loadingScreen.style.display = 'none';
        userListContainer.style.display = 'block';
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        userListContainer.innerHTML = '<li>Error loading leaderboard.</li>';
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadLeaderboard();
});


