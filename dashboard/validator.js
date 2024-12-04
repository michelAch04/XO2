import { getFirestore, getDocs, collection, query } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"; 
const db = getFirestore();

async function getRoomCodes(){

    try{
        const roomsCollection = collection(db, "Rooms");
        const roomCodeQuery = query(roomsCollection);
        const querySnapshot = await getDocs(roomCodeQuery);

        // Map through documents and return an array of room codes
        return querySnapshot.docs.map(doc => doc.data().RoomCode);
    }
    catch (error) {
        console.error("Error fetching room codes: ", error);
    } 

}

export async function validateCode(mode, code){
    //if mode = 0 -> creating new code
        //compare code to list of codes
            //if no codes match then accept code as valid
            //else mark as invalid

    //if mode = 1 -> entering existing code
        //compare code to list of codes
            //if no codes match then code is invalid
            //else accept code

    try{
        const roomCodes = await getRoomCodes(); // Fetch existing room codes
        // window.alert(`validator awaited ${roomCodes}`);

        if (mode === 0){ 
            // Check if the code does not exist in the list
            return roomCodes.includes(code) ? { isValid: false, message: `Code ${code} already exists.` } 
                                            : { isValid: true, message: `Code ${code} is valid for creation.` };
        } 
        else if (mode === 1){
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