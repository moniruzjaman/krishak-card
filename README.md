# 🌾 কৃষক কার্ড — Farmers Card System

> **A blockchain-enabled digital identity and services platform for Bangladesh farmers**
> Built on the DAE concept paper and the *From Farm to Forecast* multi-stakeholder agricultural intelligence framework.

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Claude AI](https://img.shields.io/badge/AI-Claude%20Haiku-orange)](https://anthropic.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Features

| Tab | Description |
|-----|-------------|
| **Dashboard** | Farmer profile, balance, 7-day rainfall forecast, quick actions |
| **Services** | 10 Krishok Card services: subsidy, loan, seeds, machinery, insurance, market, training, health, govt procurement, digital records |
| **My Crops** | Registered crops with health status, input tracking, yield estimates |
| **Blockchain Ledger** | Immutable on-chain transaction log (Hyperledger Fabric · PBFT · SSI) |
| **AI Advisor** | Multi-turn Claude-powered chat for IPM, disease ID, fertilizer, market timing |

---

## Project Structure

```
krishok-card/
├── api/
│   └── chat.js              # Vercel serverless — secure Claude proxy
├── src/
│   ├── components/
│   │   ├── AIAdvisor.jsx
│   │   ├── BlockchainLedger.jsx
│   │   ├── Crops.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FarmersCard.jsx
│   │   └── Services.jsx
│   ├── data/index.js        # Mock data + AI system prompt
│   ├── hooks/useChat.js     # API hook (dev direct / prod proxy)
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── vercel.json
└── package.json
```

---

## Local Development

```bash
git clone https://github.com/YOUR_ORG/krishok-card.git
cd krishok-card
npm install
cp .env.example .env.local   # add your VITE_ANTHROPIC_API_KEY
npm run dev
```

---

## Deploy to Vercel

```bash
npm i -g vercel && vercel
```

Add one environment variable in the Vercel dashboard:

| Name | Environment |
|------|-------------|
| `ANTHROPIC_API_KEY` | Production + Preview |

The key **never** reaches the browser — all AI calls go through `/api/chat`.

---

## API Security Model

```
Browser  →  /api/chat (Vercel serverless)  →  Anthropic API
                      ↑
              ANTHROPIC_API_KEY lives here only
```

---

## Blockchain Reference Architecture

Per *From Farm to Forecast*:
- **Platform:** Hyperledger Fabric (permissioned consortium)
- **Consensus:** PBFT — ~600 TPS, ~500ms latency
- **Storage:** Hybrid on-chain/off-chain (IPFS + Hadoop)
- **Identity:** Self-Sovereign Identity (SSI) via DIDs + VCs
- **Access control:** XACML attribute-based policies

---

## Pilot Sites (8 Divisions)

Dhaka · Rajshahi · Rangpur · Mymensingh · Khulna · Barisal · Sylhet · Chattogram

---

## Roadmap

- [ ] Real NID authentication
- [ ] Live DAE subsidy API integration
- [ ] SMS fallback for feature phones
- [ ] Bangla voice input / TTS
- [ ] Offline-first PWA
- [ ] Hyperledger Fabric testnet integration

---

*স্বপ্ন নয় বাস্তবতা এক সাথে — Not a dream, but reality together.*
