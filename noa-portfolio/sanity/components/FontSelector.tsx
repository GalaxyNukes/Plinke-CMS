"use client";

import { useEffect, useCallback } from "react";
import { set, ObjectInputProps } from "sanity";
import { Card, Stack, Select, Text, Flex, Box, Label } from "@sanity/ui";
import { DISPLAY_FONTS, BODY_FONTS, buildGoogleFontsUrl, FontOption } from "../lib/fontData";

function loadGoogleFont(family: string, weights: number[]) {
  const id = `gfont-${family.replace(/ /g, "-")}`;
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const url = buildGoogleFontsUrl([{ family, weights }]);
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

function createFontSelector(fonts: FontOption[], label: string, defaultFamily: string) {
  return function FontSelectorInput(props: ObjectInputProps) {
    const { value, onChange } = props;

    const family: string = (value as any)?.family || defaultFamily;
    const weight: string = (value as any)?.weight || "700";

    const fontInfo = fonts.find((f) => f.value === family) || fonts[0];
    const availableWeights = fontInfo?.weights || [400, 700];

    // Load font for preview whenever family changes
    useEffect(() => {
      if (family) loadGoogleFont(family, availableWeights);
    }, [family]);

    const handleFamilyChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFamily = e.target.value;
        const newFontInfo = fonts.find((f) => f.value === newFamily);
        const defaultWeight = newFontInfo?.weights.includes(700)
          ? "700"
          : String(newFontInfo?.weights[newFontInfo.weights.length - 1] || 400);
        onChange([
          set(newFamily, ["family"]),
          set(defaultWeight, ["weight"]),
        ]);
      },
      [onChange]
    );

    const handleWeightChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(set(e.target.value, ["weight"]));
      },
      [onChange]
    );

    const previewStyle: React.CSSProperties = {
      fontFamily: `"${family}", sans-serif`,
      fontWeight: Number(weight),
    };

    return (
      <Stack space={4}>
        <Stack space={2}>
          <Label size={1} style={{ color: "var(--card-muted-fg-color, #888)" }}>
            {label}
          </Label>

          {/* Font family dropdown */}
          <Stack space={2}>
            <Text size={1} weight="semibold">Font Family</Text>
            <Select
              value={family}
              onChange={handleFamilyChange}
              style={{ width: "100%" }}
            >
              {fonts.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Stack>

          {/* Weight dropdown */}
          <Stack space={2}>
            <Text size={1} weight="semibold">Weight</Text>
            <Select
              value={weight}
              onChange={handleWeightChange}
              style={{ width: "100%" }}
            >
              {availableWeights.map((w) => (
                <option key={w} value={String(w)}>
                  {w === 100 ? "100 — Thin" :
                   w === 200 ? "200 — Extra Light" :
                   w === 300 ? "300 — Light" :
                   w === 400 ? "400 — Regular" :
                   w === 500 ? "500 — Medium" :
                   w === 600 ? "600 — Semi Bold" :
                   w === 700 ? "700 — Bold" :
                   w === 800 ? "800 — Extra Bold" :
                   w === 900 ? "900 — Black" : String(w)}
                </option>
              ))}
            </Select>
          </Stack>
        </Stack>

        {/* Live preview */}
        <Card
          padding={4}
          radius={2}
          tone="transparent"
          style={{
            background: "rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack space={3}>
            <Text size={0} muted>Preview</Text>
            <Box>
              <div style={{ ...previewStyle, fontSize: "32px", lineHeight: 1.1, marginBottom: "8px" }}>
                NOA PLINKE
              </div>
              <div style={{ ...previewStyle, fontSize: "22px", lineHeight: 1.2, marginBottom: "6px" }}>
                Noa Plinke
              </div>
              <div style={{ ...previewStyle, fontSize: "15px", lineHeight: 1.5, opacity: 0.6 }}>
                3D Gameplay Animator — noaplinke.com
              </div>
            </Box>
            <Text size={0} muted>
              {family} · {weight}
            </Text>
          </Stack>
        </Card>
      </Stack>
    );
  };
}

export const DisplayFontSelector = createFontSelector(
  DISPLAY_FONTS,
  "Display Font (headings, titles, logo)",
  "Syne"
);

export const BodyFontSelector = createFontSelector(
  BODY_FONTS,
  "Body Font (paragraphs, descriptions, UI)",
  "DM Sans"
);
