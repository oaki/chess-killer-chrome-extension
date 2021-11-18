import * as Chess from "chess.js";
import {io} from "socket.io-client";
import {showResult} from "./banner";
import {PATH} from "./config";
import {isWhiteOrientation} from "./utils";

let lastKey = "";
let lastSocket = "";

export function getSocket(host, token, multiPv) {
  let lastFen = "";
  if (`${host}_${token}` === lastKey) {
    return lastSocket;
  }
  const socket = io(host, {
    path: PATH,
    query: {
      token: token,
      type: "user"
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 99999
  });
  lastKey = `${host}_${token}`;
  lastSocket = socket;

  socket.on("connection", () => {
    console.log("Connection:", socket.id);
  });

  socket.on("disconnected", () => {
    console.log("Disconnected", socket.id);
  });

  socket.on("workerEvaluation", (result) => {
    const arr = JSON.parse(result);

    const results = arr.filter((data) => data.fen === lastFen);
    if (results && results.length > 0) {

      let str = "";
      results.forEach((multipv) => {

        if (multipv.m) {
          str += `<b style="display: inline-block; min-width:40px;"> Mate: ${multipv.mate} move, </b>`
        } else {

          str += `<b style="display: inline-block; min-width:40px;">${multipv.s}, </b>`
        }

        // const sanMoves = prepareEvaluation(multipv.p, lastFen);
        // str += ` ${sanMoves.slice(0,10).join(' ')} Depth:${multipv.d}, Nodes:${formatNumber(multipv.n)}, TbHits: ${formatNumber(multipv.h)}   <br/>`;
        // str += ` ${multipv.p}, depth:${multipv.d}  <br/>`;
        const moves = multipv.p.split(" ").slice(0, 4).join(" ");
        str += ` ${moves} Depth:${multipv.d}, Nodes:${formatNumber(multipv.n)}, TbHits: ${formatNumber(multipv.h)}   <br/>`;

        if (isVeryPositiveScoreForYou(multipv.s)) {
          str = `<div style=""><span style="display: inline-block;width:10px;height:10px;margin-right:5px;background-color: darkorange;"></span>${str}</div>`;
        }
      });
      showResult(str);
    }
  });

  return {
    sendNewMove: function (fen, move, moves_str) {
      lastFen = fen;
      const newPosition = {
        move,
        FEN: fen,
        mode: "engine",
        multiPv: multiPv,
        moves: moves_str
      };
      // console.log("newPosition", newPosition);
      socket.emit("setNewPosition", newPosition);
    }
  }
}

function isVeryPositiveScoreForYou(score) {
  if (isWhiteOrientation() && Number(score) > 3) {
    return true;
  }

  if (!isWhiteOrientation() && Number(score) < -3) {
    return true;
  }

  return false;
}


const ChessInstance = new Chess();

export function splitPv(pv) {
  if (typeof pv !== "string") {
    return [];
  }
  return pv.split(" ");
}

function prepareEvaluation(pv, fen, maxLength = 10) {
  // const chess = new Chess(fen);
  ChessInstance.load(fen);

  const moves = splitPv(pv);

  const newMoves = [];
  if (moves && moves.length > 0) {
    for (let i = 0; i < Math.min(moves.length, maxLength); i++) {
      const move = moves[i];
      const newMove = ChessInstance.move(move, {sloppy: true});
      if (!newMove) {
        //console.log("Move doesn't exist", { move, fen });
        break;
      }

      let annotationMove = `${newMove.san}`;
      newMoves.push(annotationMove);
    }
  }

  return newMoves;
}


function formatNumber(num) {
  if (num) {
    const n = Number(num);

    let _num = 1000000 * 1000;
    if (n > _num) {
      const d = n / _num;
      return `${d.toFixed(2)}B`;
    }

    if (n > 1000000) {
      const d = n / 1000000;
      return `${d.toFixed(2)}M`;
    }

    if (n > 1000) {
      const d = n / 1000;
      return `${d.toFixed(0)}K`;
    }

    return n;

  }
  return 0;
}