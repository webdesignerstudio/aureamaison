const fs = require('fs');
const path = require('path');

const helpers = fs.readFileSync('/tmp/quote_helpers.tsx', 'utf-8');
const form = fs.readFileSync('/tmp/quote_form.tsx', 'utf-8');

const outFile = path.join(__dirname, '../src/components/landing/quote-form.tsx');

const imports = [
  '"use client";',
  '',
  'import { useState } from "react";',
  'import { C } from "@/lib/landing/colors";',
  'import { useMobile } from "@/hooks/use-mobile";',
  'import { simuleerEmail } from "@/lib/landing/utils";',
  'import { DIENST_PRODUCTS } from "@/lib/landing/data";',
  'import { useCreateOrder } from "@/hooks/use-orders";',
  '',
];

// Replace getOrders/setOrders/getUsers/setUsers/db with Supabase hooks
// We keep the exact UI but replace the backend calls
const modifiedForm = form
  .replace(/const all = await getOrders\(\);[\s\S]*?await setOrders\(\[newOrder, \.\.\.all\]\);[\s\S]*?db\.invalidate\(K\.orders\);/, `
    // Save order to Supabase via hook (called via mutate in component body)
    await createOrderMutate({
      client_name: newOrder.clientName,
      client_email: newOrder.clientEmail || "",
      straat: "",
      postcode: newOrder.postcode || "",
      plaats: "",
      vloer_type: newOrder.vloerType,
      oppervlakte: Number(newOrder.oppervlakte) || 0,
      budget: Number(budget) || 0,
      timing: newOrder.timing || "",
      status: "ingediend",
      notes: newOrder.opmerking || "",
      company_id: "11111111-1111-1111-1111-111111111111",
    });
  `)
  .replace(/\/\/ Fase 3: automatisch een klant-account aanmaken bij de offerte[\s\S]*?\/\* account-aanmaak faalt stil; offerte blijft geldig \*\//, `
    // User account creation skipped for landing page (handled in portal)
  `)
  .replace(/async function doSubmit\(\)/, 'async function doSubmit(createOrderMutate: any)')
  .replace(/function QuoteForm\(\{ onClose, onDone \}\)/, 'function QuoteForm({ onClose, onDone }: { onClose: () => void; onDone?: (order: any) => void })');

const output = [
  ...imports,
  helpers,
  '',
  modifiedForm,
  '',
  'export default QuoteForm;',
].join('\n');

fs.writeFileSync(outFile, output);
console.log('quote-form.tsx assembled:', outFile);
console.log('Output size:', output.split('\n').length, 'lines');
