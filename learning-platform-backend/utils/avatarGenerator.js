const crypto = require("crypto");

const generateAvatarData = (nickname) => {
  const hash = crypto.createHash("md5").update(nickname).digest();
  const color = `rgb(${hash[0] + 128}, ${hash[1] + 128}, ${hash[2] + 128})`;

  let matrix = Array.from({ length: 12 }, (_, y) =>
    Array.from({ length: 6 }, (_, x) => hash[(y * 6 + x) % hash.length] % 2)
  );
  matrix = matrix.map((row) => [...row, ...row.reverse()]); // Симметрия

  for (let i = 0; i < 12; i++) {
    matrix[0][i] = 0;
    matrix[11][i] = 0;
    matrix[i][0] = 0;
    matrix[i][11] = 0;
  }

  return { matrix, color };
};

module.exports = generateAvatarData;
