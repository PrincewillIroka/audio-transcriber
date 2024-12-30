class CaptureAudio {
  constructor() {
    this.requestUserPermission();
    this.handleEvents();
  }

  requestUserPermission() {
    try {
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    } catch (error) {
      console.error("Get user permission failed:", error);
    }
  }

  handleEvents() {
    chrome.runtime.onMessage.addListener(
      async (request, sender, sendResponse) => {
        if (["START_CAPTURE", "STOP_CAPTURE"].includes(request.action)) {
          await navigator.mediaDevices
            .getUserMedia({
              audio: true,
              video: false,
            })
            .then((audioStream) => {
              this.audioProcessor = new AudioProcessor(audioStream);
              if (request.action === "START_CAPTURE") {
                this.audioProcessor.startRecording();
              } else {
                this.audioProcessor.stopRecording();
              }
            });
        }
      }
    );
  }
}

//Run class constructor
new CaptureAudio();

class AudioProcessor {
  constructor(audioStream) {
    this.audioStream = audioStream;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.speechRecognition = null;
  }

  initSpeechRecognition() {
    const recognition =
      window.SpeechRecognition || new window.webkitSpeechRecognition() || null;
    if (!recognition) {
      alert("Web Speech API not supported");
      return null;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      this.processTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    return recognition;
  }

  startRecording() {
    if (!this.speechRecognition) {
      this.speechRecognition = this.initSpeechRecognition();
    }

    if (this.speechRecognition) {
      this.speechRecognition.start();
    }

    this.mediaRecorder = new MediaRecorder(this.audioStream, {
      mimeType: "audio/webm",
    });
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
        // this.transcribeAudioChunk(event.data);
      }
    };

    // this.mediaRecorder.onstop = this.processAudioChunks.bind(this);

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }

    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  processTranscript(transcript) {
    const processedTranscript = this.cleanTranscript(transcript);

    this.displayTranscript(processedTranscript);
  }

  cleanTranscript(transcript) {
    return transcript
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .trim();
  }

  displayTranscript(transcript) {
    chrome.runtime.sendMessage({ transcript });
  }

  async processAudioChunks() {
    const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

    try {
      // Send to backend API for advanced transcription
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcriptionResult = await response.json();
      console.log("Backend Transcription:", transcriptionResult);
    } catch (error) {
      console.error("Transcription processing error:", error);
    }
  }
}
