import { toast as baseToast } from "react-hot-toast";

// Shared defaults applied to every notification so the look/behaviour
// is controlled from a single place.
const defaultOptions = { duration: 3000 };

// Central notification helper. Import `toast` from THIS file instead of
// "react-hot-toast" so all notifications share the same defaults.
// It can be called directly (`toast("message")`) or by type
// (`toast.success(...)`, `toast.error(...)`).
const notify = (message, options) =>
  baseToast(message, { ...defaultOptions, ...options });

notify.success = (message, options) =>
  baseToast.success(message, { ...defaultOptions, ...options });

notify.error = (message, options) =>
  baseToast.error(message, { ...defaultOptions, ...options });

notify.loading = (message, options) => baseToast.loading(message, options);

notify.promise = (promise, messages, options) =>
  baseToast.promise(promise, messages, options);

notify.custom = (renderer, options) => baseToast.custom(renderer, options);

notify.dismiss = (id) => baseToast.dismiss(id);

export { notify as toast };
export default notify;
