import { Box, Button, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

export default function ESign() {

  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const imageRef = useRef<string | null>(null);
  const [img, setImg] = useState<string>("");


  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
    setImg("");
  };

  const handleExportCanvas = () => {
    canvasRef.current?.exportImage("png")
      .then((res) => {
        imageRef.current = res;
        setImg(res);
      })
      .catch((res) => console.log(res))
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#fff" }}>
      <Typography sx={{ p: 1 }} variant="h3">Sign here</Typography>
      <Box sx={{ p: 1, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          type="button"
          disabled={false}
          onClick={handleClearCanvas}
        >
          Clear
        </Button>

        <Button
          variant="contained"
          type="button"
          disabled={false}
          onClick={handleExportCanvas}
        >
          Export
        </Button>
      </Box>
      <Box sx={{ p: 1, maxWidth: "90vw", maxHeight: "90vh" }}>
        <ReactSketchCanvas
          ref={canvasRef}
          width="100%"
          height="70vh"
          canvasColor="transparent"
          strokeColor="#000"
          exportWithBackgroundImage={true}
        />
      </Box>
      <img src={img} width={"100%"} height={250} />
    </Box>
  );
}
