var express = require('express')
var app = express()
const cors = require('cors')
app.use(cors())

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
io.origins('*:*')

require('./routes/socketRoutes.js')(io) //connecting socket.io from socketRoutes
require('./routes/chatAppRoutes')(app);

require('dotenv/config')

const mongoose = require('mongoose')
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


mongoose.connect(
  process.env.MONGODB_URI,{  
  useNewUrlParser: true,
  useUnifiedTopology: true
},()=>console.log('connected to DB')
)

mongoose.set('useFindAndModify', false)

if (process.env.NODE_ENV === 'production') {

  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 80;
  
http.listen(PORT, function(){
  console.log('listening on *:80');
});
