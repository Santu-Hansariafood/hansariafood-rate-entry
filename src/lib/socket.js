export const setIO = (ioInstance) => {
  global._io = ioInstance;
};

export const getIO = () => {
  return global._io;
};

export const emitNotification = (data) => {
  const io = global._io;
  if (io) {
    io.emit('notification', data);
  } else {
    
  }
};
