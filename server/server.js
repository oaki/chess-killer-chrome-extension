const app = require('express')();
const https = require('https');
const fs = require('fs');
const PORT = 5000;
// const DELAY = 5000;
const DELAY = "5000";
const MULTI_VP = 3;
const DEPTH = 25;
// const STOCKFISH_PATH = '/usr/games/stockfish';
const STOCKFISH_PATH = __dirname + '/stockfish';
const spawn = require('child_process').spawn;


class EngineInterface {

  constructor(id, cmd) {
    this.id = id;
    this.cmd = cmd;
    this.child = spawn(this.cmd, []);
    this.fen = '';

    // let result = '';
    //
    // this.child.stdout.on('data', function (buffer) {
    //   this.stdout += buffer.toString();
    //   result = this.stdout;
    // });

    // this.child.stdout.on('end', function () {
    //   callback(this.stdout);
    //   console.log('on->end ID:', id);
    // });

    // let previousResult = '';
    // this.loop = setInterval(() => {
    //   if (previousResult !== result) {
    //     console.log('loop ID:', id, result);
    //     callback(result);
    //     previousResult = result;
    //   }
    // }, 1000);
  }

  on(handler, callback) {
    this.child.stdout.on(handler, callback);
  }

  findBestMove(fen, position, delay) {
    this.fen = fen;
    this.send(`stop`);
    this.send(`position fen ${fen} moves ${position}`);
    this.send(`go movetime ${delay}`);
  }

  send(cmd) {
    console.log('command: ' + cmd);
    this.child.stdin.write(cmd + "\n");
  }
}


const httpsOptions = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem')
};

const server = https.createServer(httpsOptions, app);

server.listen(PORT, () => {
  console.log('Server running at ' + PORT);
});

const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  let engine = new EngineInterface(socket.id, STOCKFISH_PATH);
  engine.send('uci');
  engine.send('eval');
  engine.send('isready');
  engine.send('ucinewgame');
  engine.send(`setoption name multipv value ${MULTI_VP}`);
  engine.send('setoption name OwnBook value true');
  // engine.send('go');


  engine.on('data', function (buffer) {

    const bestmove = buffer.toString();
    // console.log('engine.on(data)', bestmove);
    socket.emit('on_result', {
      fen: engine.fen, data: bestmove
    });
  });

  engine.on('end', function (bestmove) {
    // callback(this.stdout);

    // console.log('bestmove', bestmove);
    // socket.emit('on_result', {
    //   fen: engine.fen, data: bestmove
    // });
  });

  socket.on('new_move', (data) => {

    engine.findBestMove(data.FEN, data.position, DELAY);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});