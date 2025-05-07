# SillyTavern Multi-Provider API Key Switcher With Sets

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

## Basic Usage

1.  Go to API Connections > select provider.
2.  Ensure `allowKeysExposure` is `true` in your config.
3.  Find the "**Key Set Manager**" section below the main settings.
4.  If wanted, use **Add New Set** to create a new set, and then name it. If not, click within ***Default*** textbox.  
5.  Add alternate keys (one per line/; separated) to chosen set.
6.  Click **Activate Set** to make wanted set active. Only one set may be active at a time. 
7.  Click **Delete Set** to remove desired set.
8.  Use "**Toggle Switching**" to enable auto-rotation/removal for that provider. Keys can currently only be rotated when toggle is set on. By default, keys are set to rotate on error. Removal can be added by changing settings in **Manage Error Actions**.

## Advanced Usage

1. Click **Manage Error Actions** to expand the error code settings menu.
2. For each listed error code (e.g., 400, 401, 429, etc), you can choose either:
  *   **Rotate:** If this error occurs, the current key will be kept, and the system will switch to the next key in the active set for the *next* attempt.
  *   **Remove:** If this error occurs, the current key will be considered invalid and moved to the Recycle Bin. The system will then switch to the next available key in the active set.
  *   **(None - uncheck both):** If this error occurs, no automatic key switching or removal action will be taken.
3. If an error code is set to remove keys upon trigger, then when triggered, it will be removed from the active set and enter the **Recycle Bin**.
4. In the **Recycle Bin**, keys will have their reason for removal listed, along with the timestamp of when removal occured. Keys can then be either restored to their original Set, or permananemtly deleted from the **Recycle Bin**.
---

*Manage keys responsibly.*

## To-Do
* Add options to customize automatic action (remove vs. rotate) based on error type (e.g., 401 vs 429).
* Recycle bin - actually detect the error codes/reasons for removal
* Enable assigning specific key sets to characters for automatic switching on character load.
-------------------------------------------------------------------------------------------------------------------------
* Track message count/history per key.
* Add option for keys removed due to quota limits to automatically restore after a set time (e.g., 24h).
* Integrate with external proxy tools to switch system proxy based on the active key set.
