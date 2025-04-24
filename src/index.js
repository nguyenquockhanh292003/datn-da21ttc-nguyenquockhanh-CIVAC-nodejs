const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const route = require('./routes');
const connectDB = require('./app/database'); 
const CreateAdmin = require('./app/controllers/command/user/CreateAdmin');
const setupSwagger = require('../src/app/Extesions/swagger');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

// Kết nối tới MongoDB
connectDB();
CreateAdmin.CreateAdmin();

//Đinh tuyến đường dẫn file tĩnh
app.use(express.static(path.join(__dirname, 'public')));  

//Middleware
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// Http logger
app.use(morgan('combined'));

// Template engine 
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    calculateAge: function(birthDate) {
      const date = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDifference = today.getMonth() - date.getMonth();

      // Nếu chưa đến sinh nhật trong năm nay, giảm tuổi đi 1
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < date.getDate())) {
          age--;
      }
      return age;
    },
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('vi-VN', options); // Định dạng theo Việt Nam
    },
    eq: function(a, b) {
      return a === b;
    }, 
    formatDatePreviou: function(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2); // Add leading zero if necessary
      const day = ('0' + d.getDate()).slice(-2); // Add leading zero if necessary
      return `${year}-${month}-${day}`;
    },
    isPriceZero: function(price) {
      return price === 0;
    },
    formatDuration: function(duration) {
        const timeParts = duration.split(':');
        let hours = parseInt(timeParts[0], 10);
        let minutes = parseInt(timeParts[1], 10);
        let seconds = parseInt(timeParts[2], 10);

        if (hours === 0) {
            return `${minutes} phút ${seconds} giây`;
        }
        return `${hours} giờ ${minutes} phút ${seconds} giây`;
    },
    isCompleted: function(status) {
      return status === 'completed'; 
    },
    isInProcess: function(status) {
      return status === 'in_progress'; 
    },
    increment: function(value) {
      return value + 1; 
    }, 
    getDeviceNames: function(devices) {
      return devices.map(device => device.device.name).join(', ');
    },
    getTotalQuantity: function(devices) { 
      return devices.reduce((total, device) => total + device.quantity, 0);
    },
    currency: function(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    sum: function(a, b) {
      return a + b;
    }
}
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

setupSwagger(app);   

// Route
route(app);

app.listen(port, () => {
  console.log(process.env.API_URL);
})