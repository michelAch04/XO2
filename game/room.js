import { getFirestore,  doc, getDoc, setDoc, onSnapshot, updateDoc} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const db = getFirestore();

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('roomCode'); // 'roomCode' will be passed in URL

const roomRef = doc(db, "Rooms", `room-${roomCode}`); 
const startGameBtn = document.getElementById('start-game');

onSnapshot(roomRef, async (roomSnap)=>{
    if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        //load host
        try{
            const host = await getDoc(doc(db, "Users", roomData.host));
            const hostData = host.data();
            document.getElementById('host-user').innerText = hostData.username;
        }
        catch(e){console.log(e);}       
        
        //load guest
        try{
            const guest = await getDoc(doc(db, "Users", roomData.guest));
            const guestData = guest.data();
            document.getElementById('guest-user').innerText = guestData.username;
        }
        catch(e){console.log(e);}
        document.getElementById('status').innerText = roomData.status;
        document.getElementById('room-code').innerText = roomCode;
        
        if(roomData.host && roomData.guest){
            startGameBtn.style.setProperty('display', 'block');
        }
        else{
            startGameBtn.style.setProperty('display', 'none');
        }

    } else {console.log("No such room!");}
});

window.addEventListener('beforeunload', async ()=>{
    await updateDoc(roomRef, {
        status: 'waiting',
    });
});

let gameCounter = 0;
startGameBtn.addEventListener('click', async ()=>{
    //set room state to active
    await updateDoc(roomRef, {
        status: 'active',
    });

    buildBoard();    

    //create game
    const newGameRef = doc(db, "Games", `${roomCode}-game-${gameCounter++}`);
    const roomData = (await getDoc(roomRef)).data();
    console.log(roomData)
    await setDoc(newGameRef, {
        playerO: roomData.host,
        playerX: roomData.guest,
        gameState: true,
        latestMove: '',
        room: roomRef
    });
    await updateDoc(roomRef, {
        currentGame:  newGameRef,
    })

    startGame();

    //new onSnapshot
    //alternate between turns
})

function buildBoard(){
    //build board
    const boardContainer = document.getElementById('gameBoard');
    //build main grids
    for (let i = 0; i < 9; i++) {
        const grid = document.createElement('div');
        grid.classList.add('grid');
        grid.classList.add('incomplete');
        grid.setAttribute('data-grid', `${i}`);
        boardContainer.appendChild(grid);        
    }    
    //build sub-grids
    document.querySelectorAll('.grid').forEach(grid=>{
        grid.innerHTML = `
                <button class="cell" data-cell="0"></button>
                <button class="cell" data-cell="1"></button>
                <button class="cell" data-cell="2"></button>
                <button class="cell" data-cell="3"></button>
                <button class="cell" data-cell="4"></button>
                <button class="cell" data-cell="5"></button>
                <button class="cell" data-cell="6"></button>
                <button class="cell" data-cell="7"></button>
                <button class="cell" data-cell="8"></button>
        `;
        grid.classList.add('active');
        grid.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener("click", () => 
                playTurn(grid.dataset.grid, cell.dataset.cell)
            );
        });
    });
}

function startGame(){

}


//-----------------------Authentication--------------------
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