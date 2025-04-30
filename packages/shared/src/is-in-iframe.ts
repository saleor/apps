export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
