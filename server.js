const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const PORT = 8080;

const server = http.createServer(app); // CREAR SERVIDOR HTTP CON APP
const io = socketIo(server); // CONFIGURAR SOCKET.IO CON EL SERVIDOR HTTP

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/www")));

let messages = [];
let users = {}; // OBJETO PARA RASTREAR USUARIOS CONECTADOS

// CONFIGURACION DE SOCKET.IO
io.on("connection", (socket) => {
  console.log(`🟢 Usuario conectado: ${socket.id}`);

  // Guardar usuario cuando envía su nombre
  socket.on("setUser", (nombre) => {
    users[socket.id] = nombre;
    console.log(`📌 Usuario registrado: ${nombre} con ID ${socket.id}`);
  });

  // ENVIAR LOS MENSAJES PREVIOS AL NUEVO USUARIO
  socket.emit("messagesList", messages);

  // MANEJAR NUEVOS MENSAJES
  socket.on("newMessage", (data) => {
    const messageData = { nombre: data.nombre, message: data.message };
    messages.push(messageData);
    io.emit("newMessage", messageData);
  });

  socket.on("userDisconnected", (nombre) => {
    console.log(`🔴 ${nombre} ha salido del chat.`);
    delete users[socket.id]; // Eliminar del registro de usuarios
    io.emit("userLeft", nombre); // Notificar al chat que el usuario salió
  });

  // MANEJAR DESCONEXIÓN (CIERRA PESTAÑA O DESCONECTA SOCKET)
  socket.on("disconnect", () => {
    if (users[socket.id]) {
      console.log(`🔴 ${users[socket.id]} se desconectó.`);
      io.emit("userLeft", users[socket.id]); // Notificar al chat
      delete users[socket.id]; // Eliminar usuario desconectado
    } else {
      console.log(`⚪ Un usuario desconocido se desconectó.`);
    }
  });
});

// PORT LISTENING
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
