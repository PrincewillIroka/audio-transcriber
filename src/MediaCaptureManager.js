class MediaCaptureManager {
  constructor() {
    this.streams = {
      audio: null,
      combined: null,
    };
    this.mediaElements = {
      audio: null,
    };
    this.processors = {
      audioAnalyser: null,
      videoProcessor: null,
    };
    this.audioSource = () => {};
  }

  async startCapture() {
    try {
      // Audio Capture
      this.streams.audio = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Create Combined Stream
      this.streams.combined = new MediaStream([
        ...this.streams.audio.getAudioTracks(),
      ]);

      this.startStreamProcessing();

      this.setupStreamListeners();

      return this.streams;
    } catch (error) {
      console.error("Comprehensive media capture failed:", error);
      this.stopCapture();
      throw error;
    }
  }

  createMediaElements() {
    this.mediaElements.audio = new Audio();
    this.mediaElements.audio.srcObject = this.streams.audio;
  }

  startStreamProcessing() {
    const audioContext = new AudioContext();
    this.processors.audioAnalyser = audioContext.createAnalyser();
    const audioSource = audioContext.createMediaStreamSource(
      this.streams.audio
    );
    audioSource.connect(this.processors.audioAnalyser);

    const bufferLength = this.processors.audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectAudioLevel = () => {
      if (!this.streams.audio) return;

      this.processors.audioAnalyser.getByteFrequencyData(dataArray);
      const averageVolume =
        dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

      console.log("Audio Level:", averageVolume);
      this.audioLevelRAF = requestAnimationFrame(detectAudioLevel);
    };
    detectAudioLevel();
  }

  setupStreamListeners() {
    const allTracks = [...this.streams.audio.getTracks()];

    this.trackEndListeners = allTracks.map((track) => {
      const endHandler = () => {
        console.log("Track ended:", track.kind);
        this.stopCapture();
      };

      const muteHandler = () => {
        console.log("Track muted:", track.kind);
      };

      track.addEventListener("ended", endHandler);
      track.addEventListener("mute", muteHandler);

      return { track, endHandler, muteHandler };
    });
  }

  stopCapture() {
    Object.values(this.streams).forEach((stream) => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });

    // this.detectAudioLevel = () => {};
    cancelAnimationFrame(this.audioLevelRAF);
    this.audioLevelRAF = null;

    if (this.trackEndListeners) {
      this.trackEndListeners.forEach(({ track, endHandler, muteHandler }) => {
        track.removeEventListener("ended", endHandler);
        track.removeEventListener("mute", muteHandler);
      });
    }

    // Reset all streams and processors
    this.streams = {
      audio: null,
      combined: null,
    };

    this.processors = {
      audioAnalyser: null,
    };

    console.log("Media capture stopped");
  }
}

export default MediaCaptureManager;
