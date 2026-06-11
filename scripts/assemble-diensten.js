const fs = require('fs');
const path = require('path');

const currentFile = path.join(__dirname, '../src/components/landing/diensten-carousel.tsx');
const outFile = currentFile;

// Read current file to get DIENSTEN_DATA + injectStyles + DienstenCarousel
const current = fs.readFileSync(currentFile, 'utf-8');
const currentLines = current.split('\n');

// Lines 1-80: imports + DIENSTEN_DATA + injectStyles
const headerLines = currentLines.slice(0, 80);

// Lines 116-223: DienstenCarousel (from current file, which is mostly correct)
// But we need to modify it to pass onShowroom prop
const carouselLines = currentLines.slice(115); // from line 116 to end

// Read extracted components
const prodDetail = fs.readFileSync('/tmp/prod_detail.tsx', 'utf-8');
const dienstDetail = fs.readFileSync('/tmp/dienst_detail.tsx', 'utf-8');

// Build new imports
const newImports = [
  '"use client";',
  '',
  'import { useState, useEffect, useRef } from "react";',
  'import { C } from "@/lib/landing/colors";',
  'import { useMobile } from "@/hooks/use-mobile";',
  'import { useIsMobile } from "@/hooks/use-is-mobile";',
  'import { LLabel } from "./llabel";',
  'import { useProducten, simuleerEmail, toast, inp } from "@/lib/landing/utils";',
  'import { DIENST_CALC, DIENST_REVIEWS, DIENST_FAQ, DIENST_PRODUCTS, DEFAULT_PRODUCTS, GALLERY_IMGS, COMPARE_DATA } from "@/lib/landing/data";',
  '',
];

// We need to update the DienstenCarousel to pass onShowroom
// Find and replace the DienstDetail call in carouselLines
const carouselStr = carouselLines.join('\n');
const updatedCarousel = carouselStr.replace(
  /onOfferte=\{\(\) => \{ setDetail\(null\); goOfferte\(\); \}\}/,
  'onOfferte={() => { setDetail(null); goOfferte(); }} onShowroom={goShowroom}'
);

// Build output
const output = [
  ...newImports,
  ...headerLines.slice(7), // skip original imports (lines 1-7)
  '',
  prodDetail,
  '',
  dienstDetail,
  '',
  updatedCarousel,
].join('\n');

fs.writeFileSync(outFile, output);
console.log('diensten-carousel.tsx assembled:', outFile);
console.log('Output size:', output.split('\n').length, 'lines');
