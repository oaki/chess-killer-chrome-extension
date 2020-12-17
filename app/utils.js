export function isWhiteOrientation() {
  const elements = document.getElementsByClassName("orientation-white");
  return Boolean(elements);
}

export function isYourMove(moves) {
  return (isWhiteOrientation() && moves.length % 2 === 0)
    ||
    (!isWhiteOrientation() && moves.length % 2 !== 0);
}

export function stringify(moves) {
  return moves.join("|");
}