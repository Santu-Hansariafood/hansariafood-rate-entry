export const singleDeviceGuard = () => {
  const active = new Map();

  return {
    check(userId, ip) {
      const lockedIp = active.get(userId);
      return !lockedIp || lockedIp === ip;
    },

    register(userId, ip) {
      active.set(userId, ip);
    },

    release(userId) {
      active.delete(userId);
    },
  };
};
