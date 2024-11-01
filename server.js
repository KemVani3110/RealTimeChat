// Import các thư viện cần thiết cho server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Tạo ứng dụng Express và HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Tạo kết nối thời gian thực qua Socket.io

let users = []; // Mảng lưu danh sách tên người dùng

// Định nghĩa đường dẫn "/" để gửi file index.html về phía client
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Gửi giao diện chat cho client
});

// Lắng nghe sự kiện khi người dùng kết nối với server
io.on('connection', (socket) => {
  console.log('Người dùng mới kết nối'); // Thông báo khi có người dùng mới kết nối

  // Lắng nghe sự kiện setUsername từ client
  socket.on('setUsername', (username) => {
    socket.username = username; // Gán tên cho socket của người dùng
    users.push(username); // Thêm tên vào mảng người dùng
    io.emit('userList', users); // Gửi danh sách người dùng tới tất cả client
    io.emit('message', { time: getCurrentTime(), username: username, message: `${username} đã tham gia phòng chat.` }); // Thông báo người dùng mới tham gia
  });

  // Lắng nghe sự kiện chatMessage từ client
  socket.on('chatMessage', (data) => {
    const { message, time } = data; // Lấy nội dung và thời gian từ tin nhắn
    io.emit('message', { time: time, username: socket.username, message: message }); // Phát tin nhắn tới tất cả client
  });

  // Lắng nghe sự kiện khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    if (socket.username) { // Kiểm tra xem người dùng có tên không
      users = users.filter(user => user !== socket.username); // Loại người dùng khỏi danh sách
      io.emit('message', { time: getCurrentTime(), username: socket.username, message: `${socket.username} đã rời phòng chat.` }); // Thông báo người dùng rời phòng
      io.emit('userList', users); // Gửi danh sách người dùng cập nhật
    }
  });
});

// Hàm lấy thời gian hiện tại
const getCurrentTime = () => {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Trả về thời gian định dạng HH:MM
};

// Khởi động server trên cổng 3000
server.listen(3000, () => {
  console.log('Server đang chạy tại http://localhost:3000');
});
