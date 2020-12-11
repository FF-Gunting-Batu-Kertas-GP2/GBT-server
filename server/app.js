const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

const player = [];
let currentPlayer = [];
let round = [];
let gameStatus = false;
let gameDone = false;
let checkPlayer;
let readyInit;
let playerLose;
let roundStatus;
let roundEnd = false;

io.on("connection", (socket) => {
  console.log("Socket.io client connected");

  roundStatus = setInterval(checkRound, 50);
  setWinner = setInterval(finish, 1000);

  function checkRound() {
    if (roundEnd == true) {
      console.log("kirim data");
      checkPlayerLose();
      io.emit("S_sendPlayerData", round);
      roundEnd = false;
      round = [];
      gameInit();
    }
  }
  function finish() {
    if (gameDone == true) {
      console.log("game selesai", currentPlayer);
      io.emit("S_sendWinner", currentPlayer);
      gameDone = false;
    }
  }

  // Player name from client
  socket.on("C_sendName", (payload) => {
    player.push(payload);
    currentPlayer.push(payload);
    socket.emit("S_sendName", payload);
    socket.emit('allPlayers', player)
  });

  socket.on("C_getReady", (payload) => {
    round.push(payload);
  });
});

checkPlayer = setInterval(checkAllPlayer, 1000);

function checkAllPlayer() {
  console.log(player.length);

  if (player.length > 1) {
    gameInit();
    clearInterval(checkPlayer);
  }
}

function gameInit() {
  checkGameFinish();
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
  console.log(currentPlayer);
  console.log(round);
  let playerReady = 0;
  for (let i = 0; i < round.length; i++) {
    if (round[i].readyStatus == true) {
      playerReady++;
    }
  }
  if (playerReady == currentPlayer.length) {
    startRound();
    clearInterval(readyInit);
  }
}

function checkPlayerLose() {
  let nextRoundPlayer = [];

  for (let i = 0; i < round.length; i++) {
    if (round[i].health > 0) {
      nextRoundPlayer.push({
        id: round[i].id,
        name: round[i].name,
      });
    }
  }
  currentPlayer = nextRoundPlayer;
}

function checkGameFinish() {
  if (currentPlayer.length == 1) {
    gameStatus = false;
    gameDone = true;
    clearInterval(readyInit);
  }
}

server.listen(port, () => {
  console.log("connecting");
});
