export const setIO = (ioInstance) => {
  global._io = ioInstance;
};

export const getIO = () => {
  return global._io;
};

export const emitNotification = (data) => {
  try {
    const io = global._io;
    if (io && typeof io.emit === 'function') {
      io.emit('notification', data);
    } else {
      console.warn("Socket.io instance not available for emission");
    }
  } catch (err) {
    console.error("Error emitting socket notification:", err);
  }
};
