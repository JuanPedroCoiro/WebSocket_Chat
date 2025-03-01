const socket = io();
let nombre = "";

// FUNCION PARA ESTABLECER EL NOMBRE DEL USUARIO
function setName(){
    const nameInput = document.getElementById('txtNombre').value;
    if(nameInput !== ""){
        nombre = nameInput;
        socket.emit('setUser', nombre);
        document.getElementById('ingresoNombre').style.display = "none";
        document.getElementById('chat').style.display = "block";
        document.getElementById('cerrarSesion').style.display = "block";
    }
    else{
        alert("Ingrese un nombre valido");
    }
};

// FUNCION PARA ENVIAR EL MENSAJE
function sendMessage(){
    const Inputmessage = document.getElementById('txtMessage');
    const messageText = Inputmessage.value;
    if(messageText !== ""){
        socket.emit('newMessage', { nombre, message: messageText });
        Inputmessage.value = ""; // LIMPIAR ENTRADA
    }
};

// FUNCION PARA CERRAR SESION
function logout(){
    socket.emit('userDisconnected', nombre); //NOTIFICAMOS AL SERVIDOR
    nombre = "";
    document.getElementById('chat').style.display = "none";
    document.getElementById('cerrarSesion').style.display = "none";
    document.getElementById('ingresoNombre').style.display = "block";
};

// FUNCION PARA AGREGAR EL MENSAJE AL CHAT EN PANTALLA
function appendMessage(data){
    const messagesList = document.getElementById('messagesList');
    const newMessage = document.createElement('p');
    newMessage.innerHTML = `<strong>${data.nombre}:</strong> ${data.message}`;
    messagesList.appendChild(newMessage);
    messagesList.scrollTop = messagesList.scrollHeight; // AUTO SCROLL
};

// RECIBIR LA LISTA DE MENSAJES PREVIOS
socket.on('messagesList', (messages) => {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = "";
    messages.forEach((message)=> appendMessage(message));
});

// RECIBIR UN NUEVO MENSAJE
socket.on('newMessage', (data)=>{
    appendMessage(data);
});

// NOTIFICAR CUANDO UN USUARIO SALGA DEL CHAT
socket.on('userLeft', (nombre) => {
    const messagesList = document.getElementById('messagesList');
    const newMessage = document.createElement('p');
    newMessage.style.color = "red";
    newMessage.textContent = `🔴 ${nombre} ha salido del chat.`;
    messagesList.appendChild(newMessage);
});