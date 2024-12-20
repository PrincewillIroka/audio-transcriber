/*global chrome*/
import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const getActiveTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return tab;
  };

  const handleMessages = useCallback(async () => {
    const chrome = window.chrome;
    if (chrome && chrome.runtime) {
      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request.transcript) {
          const value = transcript + " " + request.transcript;
          setTranscript(value);
        }
      });
    }
  }, [transcript]);

  useEffect(() => {
    handleMessages();
  }, [handleMessages]);

  async function handeMediaCapture(value) {
    try {
      const tab = await getActiveTab();
      let action, isCapturing;

      if (value === "start") {
        action = "START_CAPTURE";
        isCapturing = true;
      } else if (value === "stop") {
        action = "STOP_CAPTURE";
        isCapturing = false;
      }

      setIsCapturing(isCapturing);
      chrome.tabs.sendMessage(tab.id, {
        action,
        // data: {
        //   message: "",
        // },
      });
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
      <div id="transcriptDisplay">{transcript}</div>
    </div>
  );
}

export default App;
