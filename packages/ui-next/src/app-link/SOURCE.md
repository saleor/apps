# Upstream source

- **Repo:** none — this has no Dashboard counterpart.

## Why it exists

Dashboard is not framed by anything, so it links with plain `react-router` links and has no
equivalent primitive. An app is different: it renders inside Dashboard's iframe, and the frame URL
is where the AppBridge handshake params live. Any document load replaces that URL with a bare one,
the app can no longer authenticate, and it shows its "no permission" state instead of the page the
merchant asked for.

`next/link` is therefore not usable for links between app pages. It navigates a plain click
client-side, but leaves ⌘-click, middle-click and "open in new tab" to the browser — each of which
lands on that dead page. `AppLink` renders the anchor (so the affordance, `title` and status bar
are real) and routes every activation through `next/router` instead.

The lost gesture is the trade: a merchant cannot open an app page in a second tab from inside the
Dashboard frame, which is a thing they could not usefully do anyway.
