function pairValues(name, str) {
  const tmp = str.split(" ");

  const namePosition = tmp.indexOf(name);

  if (namePosition === -1) {
    return false;
  }

  if (name === "pv") {
    const tmpArr = tmp.splice(namePosition + 1);
    return tmpArr.join(" ");
  }
  return tmp[namePosition + 1];

}

export function parseLine(lineStr) {
  const mate = pairValues("mate", lineStr);
  const score = parseFloat(pairValues("cp", lineStr)) / 100;
  const depth = pairValues("depth", lineStr);
  const pv = pairValues("pv", lineStr);
  const multipv = pairValues("multipv", lineStr);

  return {
    mate,
    score,
    depth,
    pv,
    multipv
  }
}

export function parseResult(result) {

  if (result.indexOf("info") === -1) {
    return false;
  }
  let lines = result.split("\n");
  lines = lines.filter((line) => line.indexOf("info") !== -1 && line.indexOf("pv") !== -1);
  if (lines.length < 1) {
    return false;
  }

  let output = [];

  lines.forEach((line) => {
    const r = parseLine(line);
    output[parseInt(r.multipv) - 1] = r;
  });

  return output;
}