const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  //console.log("Auth Header:", authHeader); // Логируем заголовок

  const token = authHeader?.split(" ")[1];
  //console.log("Extracted Token:", token); // Логируем извлеченный токен

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("Decoded Token:", decoded); // Логируем расшифрованные данные

    req.user = decoded.id;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
