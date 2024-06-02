

const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

io.use((socket, next) => {
  console.log('middleware test');
  next();
});

function sleeper(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

io.on('connection', socket => {
  const id = socket.handshake.query.id
  socket.join(id)

  socket.on('send-message', async ({ recipients, text }, callback) => {
    sleeper(250)().then(x => {
      callback({ isSuccess: true, recipients, text })
      recipients.forEach(recipient => {
        const newRecipients = recipients.filter(r => r !== recipient)
        newRecipients.push(id)
        socket.broadcast.to(recipient).emit('receive-message', {
          recipients: newRecipients, sender: id, text
        })
      })
    })
  })


  socket.on('disconnect', () => {
    console.log(`${socket.handshake.query.id} disconnected`);
  });

})


server.listen(5001)