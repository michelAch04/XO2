import { getFirestore, setDoc, doc, getDoc, getDocs, updateDoc, collection, query, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const db = getFirestore();

async function getRoomCodes() {
    try {
        const roomsCollection = collection(db, "Rooms");
        const roomCodeQuery = query(roomsCollection);
        const querySnapshot = await getDocs(roomCodeQuery);

        // Map through documents and return an array of room codes
        const roomCodes = querySnapshot.docs.map(doc => doc.data().roomCode);
        return roomCodes;
    }
    catch (error) {
        console.error("Error fetching room codes: ", error);
    }
}

export async function validateCode(mode, code) {
    //if mode = 0 -> creating new code
    //compare code to list of codes
    //if no codes match then accept code as valid
    //else mark as invalid

    //if mode = 1 -> entering existing code
    //compare code to list of codes
    //if no codes match then code is invalid
    //else accept code

    try {
        const roomCodes = await getRoomCodes(); // Fetch existing room codes
        //window.alert(`validator awaited ${roomCodes}`);

        if (mode === 0) {
            // Check if the code does not exist in the list
            return roomCodes.includes(code) ? { isValid: false, message: `Code ${code} already exists.` }
                : { isValid: true, message: `Code ${code} is valid for creation.` };
        }
        else if (mode === 1) {
            // Check if the code exists in the list
            //window.alert(`Includes entered code? -> ${roomCodes.includes(code)}`)
            return roomCodes.includes(code) ? { isValid: true, message: `Code ${code} exists and is valid.` }
                : { isValid: false, message: `Code ${code} does not exist. Please try another code` };
        }
        else {
            return { isValid: false, message: "Invalid mode specified." };
        }
    }
    catch (error) {
        console.error("Error validating code: ", error);
        return { isValid: false, message: "Error occurred while validating the code." };
    }
}

export async function createRoom(code, userID) {

    const newRoom = doc(db, 'Rooms', `room-${code}`);

    await setDoc(newRoom, {
        host: userID, //user that created the room
        guest: null, //to be set later
        status: 'waiting', //waiting, ready, active, deactivated
        roomCode: code,
        createdAt: serverTimestamp(),
    })

    redirectToRoom(code);
}

export async function enterRoom(code, userID) {

    try {
        //room with validated cod
        const roomRef = doc(db, 'Rooms', `room-${code}`);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
            alert(`Room with code ${code} does not exist.`);
            return;
        }

        const roomData = roomDoc.data();
        //same user cannot enter the same game
        if(roomData.host === userID){
            alert('You are already in the game!');
            return;
        }

        if (roomData.status === 'waiting') {
            // Add the user as the guest
            await updateDoc(roomRef, {
                guest: userID,
                status: 'ready' // Mark the room as ready since the guest joined
            });
            alert(`You have successfully joined the room: ${code}`);
            redirectToRoom(code);

        } else if (roomData.status === 'ready' || roomData.status === 'active') {
            //game already started or 2 players in room
            alert("This room is already active or in progress. Joining is not allowed.");
        } else {
            alert("This room is no longer available.");
            //replace all alerts with messages?
        }
    } catch (error) {
        console.error("Error entering room:", error);
        alert("An error occurred while trying to enter the room. Please try again.");
    }
}

function redirectToRoom(code){
    window.location.href = `/game/room.html?roomCode=${code}`;
}