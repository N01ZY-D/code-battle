import React, { useEffect, useRef } from "react";

const Avatar = ({ matrix, color, size = 48 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("Avatar component received matrix:", matrix);
    console.log("Avatar component received color:", color);

    if (
      !Array.isArray(matrix) ||
      matrix.length !== 12 ||
      !Array.isArray(matrix[0]) ||
      matrix[0].length !== 12
    ) {
      console.error("Invalid matrix format:", matrix);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas reference is null");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get canvas context");
      return;
    }

    const scale = size / 12;

    ctx.clearRect(0, 0, size, size);
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        if (matrix[y][x] === 1) {
          ctx.fillStyle = color; // Цвет единиц
        } else {
          ctx.fillStyle = "#6a6a6a"; //Цвет для нулей
        }
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }, [matrix, color, size]);

  if (
    !Array.isArray(matrix) ||
    matrix.length !== 12 ||
    !Array.isArray(matrix[0]) ||
    matrix[0].length !== 12
  ) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "#ccc",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size / 4,
          color: "#666",
        }}
      >
        ?
      </div>
    );
  }

  return <canvas ref={canvasRef} width={size} height={size} />;
};

export default Avatar;
