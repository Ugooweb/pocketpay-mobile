# QR Payment Request Format Research

## Overview

This document explores the design space for QR payment requests in the PocketPay mobile app. The goal is to understand the options, trade-offs, and risks before implementing richer QR payment requests beyond simple address-only codes.

## Current State

The app currently supports **address-only QR codes** where the QR encodes just a Stellar wallet address (e.g., `GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`).

## Format Options

### 1. Address-Only QR (Current)

**Format:** Plain Stellar address

**Pros:**
- Simple to implement
- Widely supported
- Works with any Stellar wallet

**Cons:**
- No amount pre-fill
- No memo/destination tag
- No network information
- User must manually enter amount and memo

### 2. URI-Style Payment Request (SEP-7)

**Format:** `web+stellar:pay?destination=G...&amount=10.5&memo=Hello&network=testnet`

**Example:**

**Pros:**
- Rich metadata (amount, memo, asset)
- Standardized format (SEP-7)
- Machine-readable
- Can include network (testnet/mainnet)

**Cons:**
- More complex to parse
- Requires URI scheme registration
- May not work with all wallets
- Longer QR codes

### 3. JSON-Encoded Payment Request

**Format:** Base64-encoded JSON

**Example:**
```json
{
  "version": "1.0",
  "destination": "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  "amount": "10.5",
  "asset": "XLM",
  "memo": "Invoice #123",
  "network": "mainnet",
  "expires": "2025-12-31T23:59:59Z"
}
$pocketpay.com/john.doe

---

## Step 3: Update README.md

```bash
# Update README.md to link to the research document
cat >> README.md << 'EOF'

## Documentation

- [QR Payment Request Formats](docs/qr-payment-requests.md) - Research on QR payment request formats and security considerations.
