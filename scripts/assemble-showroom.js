const fs = require('fs');
const path = require('path');

const modal = fs.readFileSync('/tmp/showroom_modal.tsx', 'utf-8');
const outFile = path.join(__dirname, '../src/components/landing/showroom-modal.tsx');

const imports = [
  '"use client";',
  '',
  'import { useState } from "react";',
  'import { C } from "@/lib/landing/colors";',
  'import { useMobile } from "@/hooks/use-mobile";',
  'import { saveShowroomAanvraag, simuleerEmail } from "@/lib/landing/utils";',
  'import { DIENST_PRODUCTS } from "@/lib/landing/data";',
  '',
];

const modifiedModal = modal
  .replace(/function ShowroomModal\(\{ onClose, prefDienst="" \}\)/, 'function ShowroomModal({ onClose, prefDienst="" }: { onClose: () => void; prefDienst?: string })');

const output = [
  ...imports,
  modifiedModal,
  '',
  'export default ShowroomModal;',
].join('\n');

fs.writeFileSync(outFile, output);
console.log('showroom-modal.tsx assembled:', outFile);
console.log('Output size:', output.split('\n').length, 'lines');
