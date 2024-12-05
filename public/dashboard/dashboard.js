import { validateCode, createRoom, enterRoom } from './validator.js';
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const messageDisplayContainer = document.getElementById('message-display');
const submittedCode = ['', '', '', '', '', '', ''];

document.getElementById('generate-code-btn').addEventListener('click', () => {
    setTimeout(() => {
        generateCode();
    }, 1000);
});
document.getElementById('submit-code-btn').addEventListener('click', () => {
    setTimeout(() => {
        submitCode();
    }, 1000);
});

document.querySelectorAll('.digit-input').forEach((input, index, inputs) => {
    const nextDigit = (index === 5) ? '' : `digit-${index + 2}`;
    input.addEventListener('input', () => moveToNext(input, nextDigit));

    input.addEventListener('keydown', e => {
        //backspace moves back one digit
        if (e.key === 'Backspace' && input.value === '') {
            const previousInput = inputs[index - 1];
            if (previousInput) {
                previousInput.focus();
            }
        }
        //enter sends code for submission
        if (e.key === 'Enter') {
            //checks if code is of the correct format
            const isValidCode = validateSubmittedCodeFormat();

            if (isValidCode) {
                document.getElementById('error-container').textContent = '';
                document.getElementById('submit-code-btn').style.setProperty('display', 'block');
                document.getElementById('submit-code-btn').textContent = `Submit : ${submittedCode.join("")}`;
            }
        }
    });
})

//-------------------------EVENT LISTENER FUNCTIONS----------------------------------//

//will check if the user is entering exactly 6 characters made of letters and numbers
function validateSubmittedCodeFormat() {
    let codeIsValid = false;

    document.querySelectorAll('.digit-input').forEach((digit, index) => {
        const character = digit.value;
        if (character.length === 1 && /^[A-Z0-9]$/.test(character)) {
            submittedCode[index] = character;
            codeIsValid = true;
        }
        else {
            document.getElementById('error-container').textContent = 'Please Enter a Complete Game Code';
            document.getElementById('submit-code-btn').style.setProperty('display', 'none');
            codeIsValid = false;
        }
    });

    return codeIsValid;
}

async function generateCode() { //for creating a code
    let validCodeEntered = false;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Allowed characters
    let code = '';

    while (!validCodeEntered) {
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex]; //generate random 6 digit code
        }

        validCodeEntered = await validateCode(0, code);
    }

    messageDisplayContainer.textContent = validCodeEntered.message;
    const createRoomBtn = document.getElementById('create-room-btn');

    //adjust styling if error or valid
    if (validCodeEntered.isValid === false) {
        alert(createRoomBtn);
        createRoomBtn.style.display = "none";
        messageDisplayContainer.style.color = "red";
        messageDisplayContainer.style.fontSize = "18px";
    }
    else {
        createRoomBtn.style.display = "block";
        messageDisplayContainer.style.color = "var(--blue-0)";
        messageDisplayContainer.style.fontSize = "14px";
    }
    enableRoomNavigator(0, code); //create new room with generated code
}

async function submitCode() {
    let validCodeEntered = false;

    validCodeEntered = await validateCode(1, submittedCode.join(""));
    const enterRoomBtn = document.getElementById('enter-room-btn');

    //adjust styling if error or valid
    if (validCodeEntered.isValid === false) {
        enterRoomBtn.style.display = "none";
        messageDisplayContainer.style.color = "red";
        messageDisplayContainer.style.fontSize = "18px";
    }
    else {
        enterRoomBtn.style.display = "block";
        messageDisplayContainer.style.color = "var(--blue-0)";
        messageDisplayContainer.style.fontSize = "14px";
    }

    //window.alert(`dashboard.js says code is ${validCodeEntered.message}.`)

    //if code valid display
    if (validCodeEntered.isValid) {
        messageDisplayContainer.classList.remove('error');
        messageDisplayContainer.classList.add('code');
    }
    //else display error
    else {
        messageDisplayContainer.classList.remove('code');
        messageDisplayContainer.classList.add('error');
    }
    messageDisplayContainer.textContent = validCodeEntered.message;
    enableRoomNavigator(1, submittedCode); //enter existing room with submitted code
}

//so that the code input moves digits on its own
function moveToNext(current, nextId) {
    current.value = current.value.toUpperCase();
    if (current.value.length === current.maxLength) {
        const nextInput = document.getElementById(nextId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

//-----------------------------------------------------------------------------------//

function enableRoomNavigator(mode, code) { //navigation
    const roomNavigator = document.querySelector('section.room-navigator');
    const createRoomBtn = document.getElementById('create-room-btn');
    const enterRoomBtn = document.getElementById('enter-room-btn');

    //clones to remove previous event listeners
    const createRoomBtnClone = createRoomBtn.cloneNode(true);
    const enterRoomBtnClone = enterRoomBtn.cloneNode(true);

    // Replace originals with clones
    createRoomBtn.replaceWith(createRoomBtnClone);
    enterRoomBtn.replaceWith(enterRoomBtnClone);

    //we are creating a room from a generated code
    if (mode === 0) {
        enterRoomBtnClone.style.setProperty('display', 'none');
        createRoomBtnClone.style.setProperty('display', 'block');
        createRoomBtnClone.addEventListener('click', () => createRoom(code, auth.currentUser.uid));
    }
    //we are entering an existing room
    else if (mode === 1) {
        createRoomBtnClone.style.setProperty('display', 'none');
        enterRoomBtnClone.style.setProperty('display', 'block');
        enterRoomBtnClone.addEventListener('click', () => enterRoom(code.join(""), auth.currentUser.uid));
    }
    roomNavigator.style.setProperty('display', 'flex');
}

//----------------------------------------EXPIRED LOGIN-----------------------------------------
const auth = getAuth();
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
            window.location.href = "/public/login/login.html";
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
            window.location.href = "/public/login/login.html";
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
            window.location.href = "/public/login/login.html";
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
        if(username === user.displayName){
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



