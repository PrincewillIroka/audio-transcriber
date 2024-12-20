chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //   chrome.storage.local.set({ audioStream: "request.audioStream" });
  const audioStream = request.audioStream;
  //   chrome.storage.sync.set({ audioStream });
});
