class AudioProcessor {
  constructor(audioStream) {
    this.audioStream = audioStream;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.speechRecognition = null;
  }

  initSpeechRecognition() {
    const recognition = window.webkitSpeechRecognition
      ? new window.webkitSpeechRecognition()
      : null;
    if (!recognition) {
      console.error("Web Speech API not supported");
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
    this.analyzeTranscriptKeywords(processedTranscript);
  }

  cleanTranscript(transcript) {
    return transcript
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .trim();
  }

  displayTranscript(transcript) {
    const transcriptElement = document.getElementById("transcriptDisplay");
    if (transcriptElement) {
      transcriptElement.textContent = transcript;
    }
  }

  analyzeTranscriptKeywords(transcript) {
    const keywords = {
      action: ["develop", "do", "make", "create", "build"],
      question: ["what", "why", "how", "when"],
      emotion: ["happy", "sad", "angry", "excited"],
    };

    const detectedCategories = Object.entries(keywords).reduce(
      (acc, [category, words]) => {
        const matches = words.filter((word) => transcript.includes(word));
        if (matches.length) {
          acc[category] = matches;
        }
        return acc;
      },
      {}
    );

    console.log("Detected keyword categories:", detectedCategories);
  }

  async processAudioChunks() {
    const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
    // const audioUrl = URL.createObjectURL(audioBlob);

    try {
      // Send to backend for advanced transcription
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

export default AudioProcessor;
