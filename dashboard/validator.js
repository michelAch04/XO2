import { getFirestore, getDocs, collection, query, select } from "firebase/firestore"; 
const db = getFirestore();

async function getRoomCodes(){

    try{
        const roomsCollection = collection(db, "Rooms");
        const roomCodeQuery = query(roomsCollection, select("RoomCode"));
        const querySnapshot = await getDocs(roomCodeQuery);

        return querySnapshot.docs.map(doc => doc.data().roomCode);
    }
    catch (error) {
        console.error("Error fetching room codes: ", error);
    } 

}

function validateCode(code){

    const codes = getRoomCodes();
    window.alert(codes);

    //validate code from backend
    //search in rooms database for code
    //if found->valid
    //else->invalid

    return false;
}
