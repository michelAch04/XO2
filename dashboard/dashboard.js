import { validateCode } from './validator.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const auth = getAuth();
let logoutTimer;

// Check if the user is authenticated
function checkAuthStatus() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);

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


const messageDisplayContainer = document.getElementById('message-display');
const submittedCode = ['','','','','','',''];

document.getElementById('generate-code-btn').addEventListener('click', ()=>{
    setTimeout(() => {
        generateCode();
    }, 1000);
});
document.getElementById('submit-code-btn').addEventListener('click', ()=>{
    setTimeout(() => {
        submitCode();
    }, 1000);
});

document.querySelectorAll('.digit-input').forEach((input, index, inputs)=>{
    const nextDigit = (index === 5) ? '' : `digit-${index+2}`;
    input.addEventListener('input', ()=>moveToNext(input, nextDigit));

    input.addEventListener('keydown', e => {
        //backspace moves back one digit
        if (e.key === 'Backspace' && input.value === '') {
            const previousInput = inputs[index - 1];
            if (previousInput) {
                previousInput.focus();
            }
        }
        //enter sends code for submission
        if (e.key === 'Enter'){
            //checks if code is of the correct format
            const isValidCode = validateSubmittedCodeFormat();
            
            if(isValidCode) {
                document.getElementById('error-container').textContent = '';
                document.getElementById('submit-code-btn').style.setProperty('display', 'block');
                document.getElementById('submit-code-btn').textContent = `Submit : ${submittedCode.join("")}`;
            }
        }
    });
})

//-------------------------EVENT LISTENER FUNCTIONS----------------------------------//

//will check if the user is entering exactly 6 characters made of letters and numbers
function validateSubmittedCodeFormat(){
    let codeIsValid = false;

    document.querySelectorAll('.digit-input').forEach((digit, index)=>{
        const character = digit.value;
        if(character.length === 1 && /^[A-Z0-9]$/.test(character)){
            submittedCode[index]=character;
            codeIsValid = true; 
        }
        else{
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

    while(!validCodeEntered){
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];        
        }

        validCodeEntered = await validateCode(0, code);
    }  

    messageDisplayContainer.textContent = validCodeEntered.message;
    enableRoomNavigator(0, code);
}

async function submitCode(){
    let validCodeEntered = false;

    validCodeEntered = await validateCode(1, submittedCode.join(""));

    //window.alert(`dashboard.js says code is ${validCodeEntered.message}.`)

    if(validCodeEntered.isValid){
        messageDisplayContainer.classList.remove('error');
        messageDisplayContainer.classList.add('code');
    }
    else{
        messageDisplayContainer.classList.remove('code');
        messageDisplayContainer.classList.add('error');
    }
    messageDisplayContainer.textContent = validCodeEntered.message;
    enableRoomNavigator(1, submittedCode);
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

function enableRoomNavigator(mode, code){
    const roomNavigator = document.querySelector('section.room-navigator');
    const createRoomBtn = document.getElementById('create-room-btn');
    const enterRoomBtn = document.getElementById('enter-room-btn');   

    const createRoomBtnClone = createRoomBtn.cloneNode(true);
    const enterRoomBtnClone = enterRoomBtn.cloneNode(true);

    // Replace originals with clones
    createRoomBtn.replaceWith(createRoomBtnClone);
    enterRoomBtn.replaceWith(enterRoomBtnClone);
    
    //we are creating a room from a generated code
    if(mode===0){
        enterRoomBtnClone.style.setProperty('display', 'none');
        createRoomBtnClone.style.setProperty('display', 'block');
        createRoomBtnClone.addEventListener('click', ()=>createRoom(code));
    }
    //we are entering an existing room
    else if(mode===1){
        createRoomBtnClone.style.setProperty('display', 'none');
        enterRoomBtnClone.style.setProperty('display', 'block');
        enterRoomBtnClone.addEventListener('click', ()=>enterRoom(code.join("")));
    }
    roomNavigator.style.setProperty('display', 'flex');
}

function createRoom(code){

    //create room
    //send user to room

    window.alert(code);
}

function enterRoom(code){

    //search for room
    //send user to room

    window.alert(code);
}