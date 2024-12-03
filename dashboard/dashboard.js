function generateCode() { //for creating a code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Allowed characters
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    document.getElementById('generated-code-container').textContent = code;
}

function moveToNext(current, nextId) { //so that the code input moves boxes on its own
    current.value = current.value.toUpperCase();
    if (current.value.length === current.maxLength) {
        const nextInput = document.getElementById(nextId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

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

document.getElementById('digit-6').addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
        const code = [0,0,0,0,0,0];
        document.querySelectorAll('.digit-input').forEach((input, index)=>{
            code[index]=input.value;
        })
        document.getElementById('entered-code-container').textContent = code.join("");
    }
})
