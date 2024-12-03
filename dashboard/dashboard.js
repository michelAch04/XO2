const codeDisplayContainer = document.getElementById('code-display');
const submittedCode = [0,0,0,0,0,0];

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
    if(validCodeEntered){
        codeDisplayContainer.textContent =`Your code is: ${submittedCode.join("")}`;
    }
    enableRoomNavigator(1, submittedCode);
}

function enableRoomNavigator(mode, code){
    const roomNavigator = document.querySelector('section.room-navigator');
    const createRoomBtn = document.getElementById('create-room-btn');
    const enterRoomBtn = document.getElementById('enter-room-btn');

    //we are creating a room from a generated code
    if(mode===0){
        enterRoomBtn.style.setProperty('display', 'none');
        createRoomBtn.style.setProperty('display', 'block');
        createRoomBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            createRoom(code);
        });
    }
    //we are entering an existing room
    else if(mode===1){
        createRoomBtn.style.setProperty('display', 'none');
        enterRoomBtn.style.setProperty('display', 'block');
        enterRoomBtn.addEventListener('click', (e)=>{
            e.preventDefault();
            enterRoom(code.join(""));
        });
    }
    roomNavigator.style.setProperty('display', 'flex');
}

function createRoom(code){
    window.alert(code);
}

function enterRoom(code){
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
    });
});

//so that code can be entered if it is complete
document.getElementById('digit-6').addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
        const errorContainer = document.getElementById('error-container');
        const submitButton = document.getElementById('submit-code-btn');
        let isValidCode = false;

        document.querySelectorAll('.digit-input').forEach((input, index)=>{
            if(input.value){
                submittedCode[index]=input.value;
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
})
