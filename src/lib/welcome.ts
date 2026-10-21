const KEY = "mutamakin:welcome";

export const WELCOME_EVENT = "mutamakin:welcome";

/** Remember to greet the person on the next page they see ("Welcome, Sara!"). */
export function rememberWelcome(name: string) {
  try {
    sessionStorage.setItem(KEY, name);
  } catch {
    // Private mode: no greeting, nothing else breaks.
  }
  window.dispatchEvent(new Event(WELCOME_EVENT));
}

/** Reads and clears the name saved by rememberWelcome, so the greeting shows once; null when there is none. */
export function takeWelcome() {
  try {
    const name = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return name;
  } catch {
    return null;
  }
}
