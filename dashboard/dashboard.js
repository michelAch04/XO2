import {validateCode} from './validator.js';

const codeDisplayContainer = document.getElementById('code-display');
const submittedCode = [0,0,0,0,0,0];


document.getElementById('generate-code-btn').addEventListener('click', ()=>window.alert('gay'));
document.getElementById('submit-code-btn').addEventListener('click', ()=>submitCode());


function generateCode() { //for creating a code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Allowed characters
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    codeDisplayContainer.textContent =`Your code is: ${code}`;
    enableRoomNavigator(0, code);
}

function submitCode(){
    let validCodeEntered = false;
    document.querySelectorAll('.digit-input').forEach(input=>{
        validCodeEntered = input.value? true: false;
    })

    validCodeEntered = validateCode(submittedCode.join(""));
    window.alert(validCodeEntered)    

    if(validCodeEntered){
        codeDisplayContainer.textContent =`Your code is: ${submittedCode.join("")}`;
    }
    enableRoomNavigator(1, submittedCode);
}

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

//so that backspace moves back a digit
document.querySelectorAll('.digit-input').forEach((input, index, inputs) => {
    input.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && input.value === '') {
            const previousInput = inputs[index - 1];
            if (previousInput) {
                previousInput.focus();
            }
        }
        if (e.key === 'Enter'){
            const errorContainer = document.getElementById('error-container');
            const submitButton = document.getElementById('submit-code-btn');
            let isValidCode = false;

            //checks if the code is complete
            document.querySelectorAll('.digit-input').forEach((digit, index)=>{
                if(digit.value){
                    submittedCode[index]=digit.value;
                    isValidCode = true; 
                }
                else{
                    errorContainer.textContent = 'Please Enter a Complete Game Code';
                    isValidCode = false;
                }
            })
            if(isValidCode) {
                errorContainer.textContent = '';
                submitButton.style.setProperty('display', 'block');
                submitButton.textContent = `Submit : ${submittedCode.join("")}`;
            }
        }
    });

});

