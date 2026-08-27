import { useAppBridge, useWidgetAutoResize } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

import { PLACEHOLDER_CSS } from "@/extensions/placeholder";

/** GET target for every extension. Renders a dashed box with the extension's label. */
export default function Placeholder() {
  const { query } = useRouter();
  const { appBridgeState } = useAppBridge();
  const rootRef = useRef<HTMLDivElement>(null);
  /** Growing/shrinking content is the only way to see whether the iframe follows along. */
  const [filler, setFiller] = useState(0);

  const { label = "Extension", mount, target, ...context } = query;

  /** Only WIDGET targets live in a resizable iframe - elsewhere there is nothing to resize. */
  useWidgetAutoResize(rootRef, target === "WIDGET");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PLACEHOLDER_CSS }} />
      <div className="ph" ref={rootRef}>
        <div className="ph-label">{label}</div>
        <div className="ph-meta">
          {mount} · {target} · GET · App Bridge {appBridgeState?.ready ? "ready" : "not connected"}
        </div>
        {Object.entries(context).map(([key, value]) => (
          <div className="ph-meta" key={key}>
            {key}: {String(value)}
          </div>
        ))}

        {target === "WIDGET" && (
          <button onClick={() => setFiller((current) => (current >= 9 ? 0 : current + 3))}>
            Resize content
          </button>
        )}
        {Array.from({ length: filler }, (_, index) => (
          <div className="ph-meta" key={index}>
            filler line {index + 1}
          </div>
        ))}
      </div>
    </>
  );
}
