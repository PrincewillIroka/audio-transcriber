import { useState, useRef } from "react";
import "./App.css";
import MediaCaptureManager from "./MediaCaptureManager";

function App() {
  const [isCapturing, setIsCapturing] = useState(false);
  const captureManagerRef = useRef();

  async function handeMediaCapture(value) {
    try {
      if (value === "start") {
        captureManagerRef.current = new MediaCaptureManager();
        setIsCapturing(true);
        await captureManagerRef.current.startCapture();
      } else if (value === "stop") {
        setIsCapturing(false);
        captureManagerRef.current.stopCapture();
      }
    } catch (error) {
      console.error("Capture error:", error);
    }
  }

  return (
    <div className="container">
      <h4 className="app-title">Meeting Integration</h4>
      <form className="capturing-form">
        <button
          type="button"
          onClick={() => handeMediaCapture("start")}
          disabled={isCapturing}
          className="button"
        >
          Start Capturing
        </button>
        <button
          type="button"
          onClick={() => handeMediaCapture("stop")}
          disabled={!isCapturing}
          className="button"
        >
          Stop Capturing
        </button>
      </form>
    </div>
  );
}

export default App;
