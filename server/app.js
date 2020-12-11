const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

const player = [];
let round = [];
let gameStatus = false;
let checkPlayer;
let readyInit;
let playerLose;
let roundStatus;
let roundEnd = false;

io.on("connection", (socket) => {
  console.log("Socket.io client connected");

  // firstPlayer = setInterval(checkPlayerJoined, 1000);
  // gameInterval = setInterval(checkGameStatus, 1000);
  roundStatus = setInterval(checkRound, 50);
  playerLose = setInterval(checkPlayerLose, 50);

  function checkRound() {
    if (roundEnd == true) {
      console.log("kirim data");
      console.log(round);
      io.emit("S_sendPlayerData", round);
      roundEnd = false;
      round = [];
      gameInit();
    }
  }

  // Player name from client
  socket.on("C_sendName", (payload) => {
    player.push(payload);
    const data = {
      payload: payload,
      player: player
    }
    io.emit("S_sendName", data);
    console.log(payload, '<<emit S_sendName')
  });

  socket.on("C_getReady", (payload) => {
    round.push(payload);
  });
});

checkPlayer = setInterval(checkAllPlayer, 1000);

function checkAllPlayer() {
  console.log(player)
  console.log(player.length);

  if (player.length > 1) {
    gameInit();
    clearInterval(checkPlayer);
  }
}

function gameInit() {
  console.log("game mulai");
  gameStatus = true;
  readyInit = setInterval(checkReady, 1000);
}

function startRound() {
  console.log("mulai ronde");
  let guntingCount = 0;
  let batuCount = 0;
  let kertasCount = 0;
  for (let i = 0; i < round.length; i++) {
    if (round[i].pick == "Gunting") {
      guntingCount++;
    } else if (round[i].pick == "Batu") {
      batuCount++;
    } else if (round[i].pick == "Kertas") {
      kertasCount++;
    }
  }
  let newRound = round;
  round = [];
  for (let i = 0; i < newRound.length; i++) {
    if (newRound[i].pick == "Gunting") {
      round.push({
        id: newRound[i].id,
        name: newRound[i].name,
        pick: newRound[i].pick,
        readyStatus: false,
        health: newRound[i].health - batuCount,
        lose: newRound[i].lose,
      });
    } else if (newRound[i].pick == "Batu") {
      round.push({
        id: newRound[i].id,
        name: newRound[i].name,
        pick: newRound[i].pick,
        readyStatus: false,
        health: newRound[i].health - kertasCount,
        lose: newRound[i].lose,
      });
    } else if (newRound[i].pick == "Kertas") {
      round.push({
        id: newRound[i].id,
        name: newRound[i].name,
        pick: newRound[i].pick,
        readyStatus: false,
        health: newRound[i].health - guntingCount,
        lose: newRound[i].lose,
      });
    }
  }
  roundEnd = true;
  console.log(round);
}

function checkReady() {
  console.log(round);
  console.log(player.length);
  let playerReady = 0;
  for (let i = 0; i < round.length; i++) {
    if (round[i].readyStatus == true) {
      playerReady++;
    }
  }
  if (playerReady == player.length) {
    startRound();
    clearInterval(readyInit);
  }
}

function checkPlayerLose() {
  for (let i = 0; i < round.length; i++) {
    if (round[i].health <= 0) {
      round[i].lose = true;
    }
  }
}

server.listen(port, () => {
  console.log("connecting");
});
