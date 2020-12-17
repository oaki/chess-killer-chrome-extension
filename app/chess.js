const Chess = require("chess.js");

export function getFen(moves) {
  const chess = new Chess();
  moves.forEach((move) => {
    chess.move(move);
  });

  return {fen: chess.fen(), history: prepareMoves(chess)};
}

function prepareMoves(chess) {
  const movesObj = chess.history({
    verbose: true
  });
  return movesObj.map(move => {
    return `${move.from}${move.to}`;
  }).join(" ");
}