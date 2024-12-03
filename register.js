//inputs
document.querySelector('#submit-button').addEventListener('click', event =>{
    event.preventDefault();
    window.alert('hello');
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const messageElement = document.getElementById("message");
  
    // Simple validation logic
    if (username === "admin" && password === "password123") {
        messageElement.style.color = "green";
        messageElement.textContent = "Login successful!";
    } else {
        messageElement.style.color = "red";
        messageElement.textContent = "Invalid username or password.";
    }
});