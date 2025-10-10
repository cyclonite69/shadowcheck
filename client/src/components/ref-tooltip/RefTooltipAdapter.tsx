import React from "react";
// ⬇️ You will paste your real component into OriginalTooltip.tsx next to this file.
import OriginalTooltip from "./OriginalTooltip";

// We pass everything through. If your component expects different prop names,
// you can remap here (tiny edits), but by default we spread the feature props.
export default function RefTooltipAdapter(props: Record<string, any>) {
  return <OriginalTooltip {...props} />;
}
