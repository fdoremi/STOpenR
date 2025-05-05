# SillyTavern Multi-Provider API Key Switcher with Sets

Manage, organize into active and inactive sets, and automatically rotate/remove multiple API keys for various AI providers in SillyTavern. Handles rate limits, depleted credits, invalid keys. Useful for multiple accounts or keys with varying traits.

## Features
*   Input multiple backup keys per provider.
*   Toggle automatic key rotation (before request) and removal (on specific errors like 401, 403, 429, invalid key).
*   Organize API keys into multiple named sets per provider (e.g., "Default", "2nd account", "High Quota").
*   Choose which set of keys is currently active for rotation and use.
*   Provider-specific error details in popups.
*   Manual controls per provider.

## Supported Providers

OpenRouter, Anthropic (Claude), OpenAI, Google AI Studio (Gemini), DeepSeek, Xai (Grok).

## Requirements

*   **`allowKeysExposure: true`** must be set in your SillyTavern `config.yaml`. This extension needs to read your list of alternate keys and the currently active key via API calls (`/api/secrets/view`, `/api/secrets/find`) for rotation and removal logic to work.

## Privacy

*   This extension operates entirely locally within your SillyTavern instance. **No API keys or usage data are ever sent to the extension creator or any third party.**

## Installation

1.  In SillyTavern Extensions panel: download using this repo's URL.
2.  Enable the downloaded extension.
3.  Restart SillyTavern & Reload UI.

## Usage

1.  Go to API Connections > select provider.
2.  Ensure `allowKeysExposure` is `true` in your config.
3.  Find the "**Multiple API Keys**" section below the main settings.
4.  Add alternate keys (one per line/; separated).
5.  Use "**Toggle Switching**" to enable auto-rotation/removal for that provider.

---

*Manage keys responsibly.*
