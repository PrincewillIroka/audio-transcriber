import { useState } from "react";
import "./App.css";

function App() {
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapturing = () => {
    alert("Capturing started!"); // Alert for starting capture
    setIsCapturing(true);
  };

  const stopCapturing = () => {
    alert("Capturing stopped!"); // Alert for stopping capture
    setIsCapturing(false);
  };

  return (
    <div className="container">
      <h5 className="app-title">Meeting Integration</h5>
      <form className="capturing-form">
        <button
          type="button"
          onClick={startCapturing}
          disabled={isCapturing}
          className="button"
        >
          Start Capturing
        </button>
        <button
          type="button"
          onClick={stopCapturing}
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
