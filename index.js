const express = require('express');

const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
require('module-alias/register');
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

const ownerRoutes = require('./src/routes/ownerRoute');
const empRoutes = require('./src/routes/employeeRoute');

const { db } = require('./src/configs/firebase/firebaseConfig');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174', // Cho phép frontend gọi API
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('API Server is running');
});
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('joinRoom', async ({ room }) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
    try {
      const messagesRef = db.collection('messages');
      const snapshot = await messagesRef.where('room', '==', room).orderBy('timestamp').get();
      
      const chatHistory = [];
      snapshot.forEach(doc => {
        chatHistory.push(doc.data());
      });
      socket.emit('loadHistory', chatHistory);
    } catch (error) {
      console.error('Error fetching chat history from Firestore:', error);
    }
    

  });

  socket.on('sendMessage', async(messageData) => {
    console.log('💬 New message:', messageData);
 
    try {
      const messageToSave = {
        ...messageData,
        timestamp: new Date(messageData.timestamp) 
      };

      await db.collection('messages').add(messageToSave);
      
      io.to(messageData.room).emit('receiveMessage', messageData);
    } catch (error) {
      console.error('❌ Error saving message to Firestore:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

app.use(express.json()); // Đọc được JSON từ body của request
app.use('/api/owners', ownerRoutes);
app.use('/api/emps', empRoutes);


let PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

