import AudioProcessor from "./AudioProcessor";

class MediaCaptureManager {
  constructor() {
    this.audioProcessor = null;
  }

  async startCapture() {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.audioProcessor = new AudioProcessor(audioStream);
      this.audioProcessor.startRecording();
    } catch (error) {
      console.error("Audio capture failed:", error);
    }
  }

  stopCapture() {
    if (this.audioProcessor) {
      this.audioProcessor.stopRecording();
    }
  }
}

export default MediaCaptureManager;
