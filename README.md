Setu FX – WhatsApp-style Remittance Demo:

A mobile-first, WhatsApp-looking chat that demos Money Transfer (FX) with Setu as the AI interface and eBIX as Merchant-of-Record. It simulates quote/validation, KYC uploads, Pinelabs checkout, and remittance UTR packaged for quick sales demos and product walkthroughs.

What this is?:

A single-page demo app that looks like a WhatsApp Business chat (“Setu FX”).
Shows the full journey: select Money Transfer → purpose/currency/amount → quote + GST → KYC → Pay Now → UTR.
No real payments: checkout & webhooks are mocked.
Mobile UI, but when opened on desktop (Netlify), it shows inside a phone frame.

Key Features:

WhatsApp-style chat UI (header, bubbles, quick replies, typing dots).
Summary/quote card with rate, INR calc, GST, TTL countdown.
KYC card (mock uploads for PAN, Passport, Purpose doc).
Mock Pinelabs checkout modal (UPI/Card/Netbanking) → success/fail.
Remittance status with UTR + downloadable receipt.
Demo Controls panel to toggle outcomes (KYC fail, payment fail, refund, delay), override rate/amount/TTL, inject UTR, expire quote.
Fully client-side — easy to host on Netlify.

Tech Stack

React + Vite (SPA)
TypeScript (optional remove types if you prefer JS)
Plain CSS (no external UI kit) for safe embedding
