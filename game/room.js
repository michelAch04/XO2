import { getFirestore,  doc, getDoc, setDoc, onSnapshot, updateDoc} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

//-----------------------Authentication--------------------
const auth = getAuth();
let logoutTimer;

// Check if the user is authenticated
function checkAuthStatus() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user.email);
            loadRoom();
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
//------------------------------------------------------------

const db = getFirestore();

const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('roomCode'); // 'roomCode' will be passed in URL

const roomRef = doc(db, "Rooms", `room-${roomCode}`); 
const startGameBtn = document.getElementById('start-game');


async function loadRoom(){
    //load page
    const unsubscribeLoad = onSnapshot(roomRef, async (roomSnap)=>{
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
            
            if(auth.currentUser.uid === roomData.host){
                if(roomData.host && roomData.guest){
                    startGameBtn.style.setProperty('display', 'block');
                    startGameBtn.addEventListener('click', async ()=>{
                        const gameRef = await setUpGame();    
                        unsubscribeLoad();                                       
                        startGame(gameRef);
                    });
                }
                else{
                    console.log('FATAL ERROR')
                }
            }
            else if(auth.currentUser.uid === roomData.guest){
                startGameBtn.style.setProperty('display', 'none');
                await setUpGame();                
                unsubscribeLoad();
            }     

        } else {console.log("No such room!");}
    });

    //update game when a user exits
    window.addEventListener('beforeunload', async ()=>{
        await updateDoc(roomRef, {
            status: 'waiting',
        });
    });
    console.log(auth.currentUser);
}

let gameCounter = 0;    
async function setUpGame(){ 
    startGameBtn.style.setProperty('display', 'none');
    
    //create game
    const newGameRef = doc(db, 'Games', `${roomCode}-game-${gameCounter++}`);
    const roomData = (await getDoc(roomRef)).data();

    if(auth.currentUser.uid===roomData.host){
        //create game doc
        console.log(newGameRef);  
        await setDoc(newGameRef, {
            playerO: roomData.host,
            playerX: roomData.guest,
            gameState: true, //true-> turn X || false-> turn o
            gameEnded: false,
            latestMove: '',
            currentTurn: 0,
            room: roomRef
        });

        //assign new game to room
        await updateDoc(roomRef, {
            status: 'active',
            currentGame:  newGameRef,
        });
        buildBoard();
        return newGameRef;
    }
    else if(auth.currentUser.uid===roomData.guest){
        const unsubscribe = onSnapshot(roomRef, async (roomSnap)=>{
            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                if(roomData.status==='active'){
                    buildBoard(unsubscribe);
                }
            }
        });
    }
    else{
        console.log('FATAL ERROR')
    }
    
}

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
    });
}

async function startGame(gameRef){
    let gameData = gameRef.data();

    const board = document.getElementById('gameBoard');
    board.querySelectorAll('div.grid').forEach(grid=>{
        grid.querySelectorAll('button').forEach(cell=>{
            cell.addEventListener("click", async () => {
                const currentMove = `${grid.dataset.grid}-${cell.dataset.cell}`;
                await updateDoc(gameRef, {
                    latestMove: currentMove,
                })
            });
        })
    })

    const playerX = gameData.playerX;
    const playerO = gameData.playerO;

    const unsubscribe = onSnapshot(gameRef, (gameSnap)=>{
        if(gameSnap.exists()){
            gameData = gameSnap.data();
            const curTurn = gameData.gameState;
            const thisPlayer = (auth.currentUser.uid === playerX);

            if(curTurn===thisPlayer){
                //enable inputs -- game.js
                //record inputs -- done
            }
            else{
                //disable inputs -- game.js
                //receive move made by other player from db
                const latestMove = gameData.latestMove;
                //mark move in board -- game.js
            }
        }
    })

    
    //true->X || false->O
    while(!gameData.gameEnded){

    }
}