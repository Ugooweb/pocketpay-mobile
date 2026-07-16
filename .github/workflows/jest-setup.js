// Patch expo's broken ReadableStream polyfill so axios's fetch adapter
// detection doesn't crash when it tries to cancel a stream that has a reader.
if (typeof ReadableStream !== 'undefined' && ReadableStream.prototype) {
  const originalCancel = ReadableStream.prototype.cancel;
  if (originalCancel) {
    ReadableStream.prototype.cancel = function (reason) {
      try {
        const result = originalCancel.call(this, reason);
        if (result && typeof result.then === 'function') {
          return result.then(undefined, () => undefined);
        }
        return result;
      } catch (err) {
        return Promise.resolve();
      }
    };
  }
}