/**
 * In-app error/info messages. Replaces window.alert(), which browsers can
 * silently block after a few pop-ups ("Don't allow this page to create more dialogs").
 */
type Listener = (msg: string) => void;
const listeners = new Set<Listener>();

export function notify(message: string) {
  console.warn("[notify]", message);
  listeners.forEach((l) => l(message));
}

export function onNotify(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
