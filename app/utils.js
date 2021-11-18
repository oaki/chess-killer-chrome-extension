export function isWhiteOrientation() {
  const elements = document.getElementsByClassName("orientation-white");
  return Boolean(elements && elements.length > 0);
}

export function isYourMove(moves) {
  const mod = moves.length % 2;
  if (isWhiteOrientation()) {
    return mod === 0;
  }

  if (!isWhiteOrientation()) {
    return mod !== 0;
  }

  return false;
}

export function stringify(moves) {
  return moves.join("|");
}
