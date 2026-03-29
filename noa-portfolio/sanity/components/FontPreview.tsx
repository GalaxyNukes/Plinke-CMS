import { useEffect, useRef } from "react";
import { useFormValue } from "sanity";
import { Card, Stack, Text, Box } from "@sanity/ui";

function loadGoogleFont(family: string) {
  const id = `gfont-preview-${family.replace(/ /g, "-")}`;
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const encoded = family.replace(/ /g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

export function FontPreview() {
  const displayFont = useFormValue(["displayFont"]) as any;
  const bodyFont    = useFormValue(["bodyFont"])    as any;

  const rawDisplayFamily = displayFont?.family || "Syne";
  const rawBodyFamily    = bodyFont?.family    || "DM Sans";

  // Use custom font name when __custom__ is selected
  const displayFamily = rawDisplayFamily === "__custom__"
    ? (displayFont?.customName || "Custom Font")
    : (rawDisplayFamily === "__sep__" ? "Syne" : rawDisplayFamily);
  const bodyFamily = rawBodyFamily === "__custom__"
    ? (bodyFont?.customName || "Custom Font")
    : (rawBodyFamily === "__sep__" ? "DM Sans" : rawBodyFamily);

  const displayWeight = displayFont?.weight || "700";
  const bodyWeight    = bodyFont?.weight    || "400";

  useEffect(() => { loadGoogleFont(displayFamily); }, [displayFamily]);
  useEffect(() => { loadGoogleFont(bodyFamily);    }, [bodyFamily]);

  return (
    <Card padding={4} radius={2} tone="transparent" style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(128,128,128,0.2)", marginBottom: "24px" }}>
      <Stack space={4}>
        <Text size={1} muted>Live Preview</Text>

        {/* Display font preview */}
        <Box>
          <Text size={0} muted style={{ marginBottom: "6px" }}>Display — {displayFamily} {displayWeight}</Text>
          <div style={{ fontFamily: `"${displayFamily}", sans-serif`, fontWeight: Number(displayWeight) }}>
            <div style={{ fontSize: "36px", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "4px" }}>
              NOA PLINKE
            </div>
            <div style={{ fontSize: "24px", lineHeight: 1.1, marginBottom: "4px" }}>
              Noa Plinke
            </div>
            <div style={{ fontSize: "16px", lineHeight: 1.2, opacity: 0.5 }}>
              3D Gameplay Animator
            </div>
          </div>
        </Box>

        <div style={{ borderTop: "1px solid rgba(128,128,128,0.2)" }} />

        {/* Body font preview */}
        <Box>
          <Text size={0} muted style={{ marginBottom: "6px" }}>Body — {bodyFamily} {bodyWeight}</Text>
          <div style={{ fontFamily: `"${bodyFamily}", sans-serif`, fontWeight: Number(bodyWeight) }}>
            <div style={{ fontSize: "15px", lineHeight: 1.6, opacity: 0.8 }}>
              Animation that hits different. Portfolio of Noa Plinke, a 3D Gameplay Animator specialising in combat systems, procedural motion, and game development.
            </div>
          </div>
        </Box>
      </Stack>
    </Card>
  );
}
