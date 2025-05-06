// @ts-nocheck
import *:///////script.js";
import * as secrets from "../../../../../scripts/secrets.js";
import * as oai from "../../../../../scripts/openai.js";
import * as popup from "../../../../../scripts/popup.js";
import { SECRET_KEYS } from "../../../../../scripts/secrets.js";

// --- Webpack Wrapper (Keep if present in original, otherwise ignore) ---
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) { /* ... */ }
var __webpack_modules__ = {};
__webpack_modules__.d = (exports, definition) => { /* ... */ };
__webpack_modules__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
const exports = {};
__webpack_modules__.d(exports, { default: () => init });
// --- End Webpack Wrapper ---


// Import functions
const scriptFunctions = {
    eventSource: script.eventSource,
    event_types: script.event_types,
    getRequestHeaders: script.getRequestHeaders,
    saveSettingsDebounced: script.saveSettingsDebounced
};
const secretsFunctions = {
    updateSecretDisplay: secrets.updateSecretDisplay,
    writeSecret: secrets.writeSecret,
    findSecret: secrets.findSecret
};
const oaiFunctions = {
    oai_settings: oai.oai_settings
};
const popupFunctions = {
    POPUP_TYPE: popup.POPUP_TYPE,
    callGenericPopup: popup.callGenericPopup
};

// Helper function to create the name for the secret storing set data
function getProviderDataSecretKey(baseSecretKey) {
    return `${baseSecretKey}_key_sets_data`;
}

// Provider sources and keys - MODIFIED for Set Data
const PROVIDERS = {
    OPENROUTER: {
        name: "OpenRouter",
        source_check: () => ["openrouter"].includes(oaiFunctions.oai_settings.chat_completion_source),
        secret_key: SECRET_KEYS.OPENROUTER,
        data_secret_key: getProviderDataSecretKey(SECRET_KEYS.OPENROUTER), // Using new data key
        form_id: "openrouter_form",
        input_id: "api_key_openrouter",
        get_form: () => document.getElementById("openrouter_form"),
    },
    ANTHROPIC: {
        name: "Anthropic (Claude)",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'claude',
        secret_key: SECRET_KEYS.CLAUDE,
        data_secret_key: getProviderDataSecretKey(SECRET_KEYS.CLAUDE), // Using new data key
        form_id: "claude_form",
        input_id: "api_key_claude",
        get_form: () => document.getElementById("claude_form"),
    },
    OPENAI: {
        name: "OpenAI",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'openai',
        secret_key: SECRET_KEYS.OPENAI,
        data_secret_key: getProviderDataSecretKey(SECRET_KEYS.OPENAI), // Using new data key
        form_id: "openai_form",
        input_id: "api_key_openai",
        get_form: () => document.getElementById("openai_form"),
    },
    GEMINI: {
        name: "Google AI Studio (Gemini)",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'google',
        secret_key: SECRET_KEYS.MAKERSUITE,
        data_secret_key: getProviderDataSecretKey(SECRET_KEYS.MAKERSUITE), // Using new data key
        form_id: "makersuite_form",
        input_id: "api_key_makersuite",
        get_form: () => document.getElementById("makersuite_form"),
    },
    DEEPSEEK: {
        name: "DeepSeek",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'deepseek',
        secret_key: SECRET_KEYS.DEEPSEEK,
        data_secret_key: getProviderDataSecretKey(SECRET_KEYS.DEEPSEEK), // Using new data key
        form_id: "deepseek_form",
        input_id: "api_key_deepseek",
        get_form: () => document.getElementById("deepseek_form"),
    },
    XAI: {
        name: "Xai (Grok)",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'xai',
        secret_key: SECRET_KEYS.XAI,
        data_secret_key: getProviderDataSecretKey(SECRET_KEYS.XAI), // Using new data key
        form_id: "xai_form",
        input_id: "api_key_xai",
        get_form: () => document.getElementById("xai_form"),
    }
};

// Provider-specific error details
const PROVIDER_ERROR_MAPPINGS = {
    [SECRET_KEYS.CLAUDE]: {
        name: "Anthropic (Claude)",
        codes: {
            400: "Invalid Request: Check the format or content of your request.",
            401: "Authentication Error: Check your API key.",
            403: "Permission Error: Your API key lacks permission for this resource.",
            404: "Not Found: The requested resource was not found.",
            413: "Request Too Large: Request exceeds the maximum size.",
            429: "Rate Limit Error: Your account has hit a rate limit.",
            500: "API Error: An unexpected internal error occurred."
        }
    },
    [SECRET_KEYS.OPENAI]: {
        name: "OpenAI",
        codes: {
            401: "Authentication Error: Invalid API key or organization.",
            403: "Permission Denied: Country, region, or territory not supported, or other permission issue.",
            429: "Rate Limit/Quota Exceeded: Too many requests or ran out of credits.",
            500: "Server Error: Issue on OpenAI's servers.",
            503: "Service Unavailable: Engine overloaded or high traffic."
        }
    },
    [SECRET_KEYS.MAKERSUITE]: {
        name: "Google AI Studio (Gemini)",
        codes: {
            400: "Invalid Argument/Failed Precondition: Malformed request or billing/region issue for free tier.",
            403: "Permission Denied: API key lacks permissions or issue with tuned model auth.",
            404: "Not Found: Requested resource (e.g., file) wasn't found.",
            429: "Resource Exhausted: Rate limit exceeded.",
            500: "Internal Error: Unexpected error on Google's side (e.g., context too long).",
            503: "Service Unavailable: Service temporarily overloaded or down.",
            504: "Deadline Exceeded: Request took too long (e.g., context too large)."
        }
    },
    [SECRET_KEYS.DEEPSEEK]: {
        name: "DeepSeek",
        codes: {
            401: "Unauthorized: Check your API key and authentication headers.",
            429: "Too Many Requests: Reduce request rate or upgrade plan.",
            500: "Server Error: Retry the request after a short delay.",
            503: "Service Unavailable: Check status page."
        }
    },
    [SECRET_KEYS.XAI]: {
        name: "Xai (Grok)",
        codes: {
            400: "Bad Request: Invalid argument or incorrect API key supplied.",
            401: "Unauthorized: Missing or invalid authorization token.",
            403: "Forbidden: API key lacks permission or is blocked.",
            404: "Not Found: Model not found or invalid endpoint URL.",
            405: "Method Not Allowed: Incorrect HTTP method used.",
            415: "Unsupported Media Type: Empty request body or missing Content-Type header.",
            422: "Unprocessable Entity: Invalid format for a field in the request body.",
            429: "Too Many Requests: Rate limit reached."
        }
    },
     // Add mappings for OpenRouter if needed, might have generic or passthrough codes
    [SECRET_KEYS.OPENROUTER]: {
        name: "OpenRouter",
        codes: {
            // OpenRouter often passes through original errors, but might have its own specific ones
            400: "Bad Request (Passthrough or OpenRouter): Check request format/model params.", // Generic 400
            401: "Authentication Error: Invalid OpenRouter API key.",
            402: "Payment Required: Account requires funds or payment method.", // Common for OpenRouter
            403: "Forbidden (Passthrough or OpenRouter): Key lacks permissions or access denied.", // Generic 403
            404: "Not Found (Passthrough or OpenRouter): Model or endpoint not found.", // Generic 404
            429: "Rate Limit/Quota Exceeded: Too many requests or insufficient credits/budget.",
            500: "Server Error (Passthrough or OpenRouter): Issue on upstream or OpenRouter's side.", // Generic 500
            503: "Service Unavailable (Passthrough or OpenRouter): Upstream overloaded or unavailable.", // Generic 503
        }
    }
};

// --- START: Error Code Preference Helpers ---
function getErrorCodePrefsKey(provider) {
    return `keyswitcher_error_prefs_${provider.secret_key}`;
}

function loadErrorCodePrefs(provider) {
    const prefsKey = getErrorCodePrefsKey(provider);
    const storedPrefs = localStorage.getItem(prefsKey);
    let prefs = {};
    if (storedPrefs) {
        try {
            prefs = JSON.parse(storedPrefs);
            // Basic validation (ensure it's an object)
            if (typeof prefs !== 'object' || prefs === null) {
                console.warn(`KeySwitcher: Invalid error code prefs found for ${provider.name}. Resetting.`);
                prefs = {};
            }
        } catch (e) {
            console.error(`KeySwitcher: Failed to parse error code prefs for ${provider.name}. Resetting. Error:`, e);
            prefs = {};
        }
    }
    // Ensure all known codes for the provider have an entry (defaulting to 'none')
    const providerCodes = PROVIDER_ERROR_MAPPINGS[provider.secret_key]?.codes || {};
    for (const code in providerCodes) {
        if (!(code in prefs)) {
            prefs[code] = 'none'; // Default to 'none' if not set
        }
    }
    return prefs;
}

function saveErrorCodePrefs(provider, prefs) {
    const prefsKey = getErrorCodePrefsKey(provider);
    localStorage.setItem(prefsKey, JSON.stringify(prefs));
}

/**
 * Gets the configured action for a given status code and provider.
 * @param {object} provider The provider object.
 * @param {number | string} statusCode The HTTP status code.
 * @returns {'rotate'|'remove'|'none'} The configured action.
 */
function getErrorCodeAction(provider, statusCode) {
    if (!statusCode) return 'none'; // Cannot determine action without status code
    const prefs = loadErrorCodePrefs(provider);
    const action = prefs[String(statusCode)]; // Prefs are keyed by string code
    return ['rotate', 'remove'].includes(action) ? action : 'none'; // Default to 'none' if invalid/missing
}
// --- END: Error Code Preference Helpers ---


// Removal Triggers - *DEPRECATED* by new preference system for status codes
// const REMOVAL_STATUS_CODES = [400, 401, 402, 403, 404, 429];
// const REMOVAL_MESSAGE_REGEX = /Unauthorized|Forbidden|Permission|Invalid|Exceeded|Internal|budget|payment/i;

// Check if current source matches a provider
const isProviderSource = (provider) => provider.source_check();

// Key switching state - Per provider
let keySwitchingEnabled = {};
let showErrorDetails = {};

// Initialize states from localStorage
Object.values(PROVIDERS).forEach(provider => {
    keySwitchingEnabled[provider.secret_key] = localStorage.getItem(`switch_key_${provider.secret_key}`) === "true";
    showErrorDetails[provider.secret_key] = localStorage.getItem(`show_${provider.secret_key}_error`) !== "false";
});

// Show error information popup (Enhanced from original, kept as is for now)
function showErrorPopup(provider, errorMessage, errorTitle = "API Error", wasKeyRemoved = false, removedKey = null) {
    let popupContent = `<h3>${errorTitle}</h3>`;
    let statusCode = null;
    let detailedError = null;
    const statusCodeMatch = errorMessage.match(/\b(\d{3})\b/);
    if (statusCodeMatch) statusCode = parseInt(statusCodeMatch[1], 10);
    try {
        const jsonMatch = errorMessage.match(/({.*})/);
        if (jsonMatch && jsonMatch[1]) detailedError = JSON.parse(jsonMatch[1]).error;
    } catch (e) { console.warn("Could not parse detailed error from message:", e); }
    const providerMapping = PROVIDER_ERROR_MAPPINGS[provider?.secret_key];
    if (providerMapping) popupContent += `<h4>Provider: ${providerMapping.name}</h4>`;
    const currentKeyElement = document.getElementById(`current_key_${provider?.secret_key}`); // Use getElementById
    if (currentKeyElement) popupContent += `<p><b>${currentKeyElement.textContent}</b></p>`;
    if (statusCode) {
        popupContent += `<p><b>Status Code:</b> ${statusCode}</p>`;
        if (providerMapping && providerMapping.codes[statusCode]) popupContent += `<p><b>Possible Reason:</b> ${providerMapping.codes[statusCode]}</p>`;
        // Show configured action based on new system
        const action = getErrorCodeAction(provider, statusCode);
        const actionText = action === 'rotate' ? 'Rotate Key' : (action === 'remove' ? 'Remove Key' : 'Do Nothing');
        popupContent += `<p><b>Configured Action:</b> ${actionText}</p>`;
    }
    if (detailedError) {
        popupContent += `<p><b>API Message:</b> ${detailedError.message || 'N/A'}</p>`;
        if (detailedError.type) popupContent += `<p><b>Type:</b> ${detailedError.type}</p>`;
        if (detailedError.code) popupContent += `<p><b>Code:</b> ${detailedError.code}</p>`;
    }
    if (wasKeyRemoved && removedKey) popupContent += `<p style='color: red; font-weight: bold; margin-top: 10px;'>Based on your settings for status code ${statusCode}, the failing API key (${removedKey}) has been automatically removed from the active set's internal list and placed in the recycle bin. Please try generating again.</p>`; // Updated text
    popupContent += `<hr><p><b>Raw Error Message:</b></p><pre style="white-space: pre-wrap; word-wrap: break-word;">${errorMessage}</pre>`;
    popupFunctions.callGenericPopup(popupContent, popupFunctions.POPUP_TYPE.TEXT, "", { large: true, wide: true, allowVerticalScrolling: true });
}

// Initialize the plugin
async function init(loadedSecrets) {
    console.log("MultiProviderKeySwitcher init function called.");
}

// Create a button element
function createButton(title, onClick) {
    const button = document.createElement("div");
    button.classList.add("menu_button", "menu_button_icon", "interactable");
    button.title = title;
    button.onclick = onClick; // The handler CAN be async

    const span = document.createElement("span");
    span.textContent = title;
    button.appendChild(span);

    return button; // Return the DOM Node directly
}

// --- Helper Functions for Set Data ---

// Defines the default structure for a provider's key set data
function getDefaultSetData() {
    return {
        activeSetIndex: 0,
        sets: [{ name: "Default", keys: "" }]
    };
}

// Loads and parses the key set data from secrets
function loadSetData(provider, loadedSecrets) {
    const dataKey = provider.data_secret_key;
    const jsonData = loadedSecrets[dataKey];
    let data;
    if (jsonData) {
        try {
            data = JSON.parse(jsonData);
            if (!data || typeof data.activeSetIndex !== 'number' || !Array.isArray(data.sets)) {
                console.warn(`KeySwitcher: Invalid data structure found for ${provider.name}. Resetting to default.`);
                data = getDefaultSetData();
            }
             if (data.sets.length === 0) {
                 data.sets.push({ name: "Default", keys: "" });
                 data.activeSetIndex = 0;
             }
             if (data.activeSetIndex < 0 || data.activeSetIndex >= data.sets.length) {
                 console.warn(`KeySwitcher: Invalid activeSetIndex (${data.activeSetIndex}) for ${provider.name}. Resetting to 0.`);
                 data.activeSetIndex = 0;
             }
        } catch (error) {
            console.error(`KeySwitcher: Failed to parse key set data for ${provider.name}. Resetting to default. Error:`, error);
            data = getDefaultSetData();
        }
    } else {
        data = getDefaultSetData();
    }
    data.sets = data.sets.map(set => ({
        name: set?.name ?? "Unnamed Set",
        keys: set?.keys ?? ""
    }));
    return data;
}

// Saves the key set data back to secrets
async function saveSetData(provider, data) {
    const dataKey = provider.data_secret_key;
    const jsonData = JSON.stringify(data);
    await secretsFunctions.writeSecret(dataKey, jsonData);
}

// Helper to split keys consistently
function splitKeys(keysString) {
    if (!keysString) return [];
    return keysString.split(/[\n;]/).map(k => k.trim()).filter(k => k.length > 0);
}

// --- End Helper Functions for Set Data ---

// Handle key rotation for the ACTIVE SET of a specific provider
async function handleKeyRotation(providerKey) {
    const provider = Object.values(PROVIDERS).find(p => p.secret_key === providerKey);
    if (!provider) {
        console.error(`KeySwitcher: handleKeyRotation called with unknown providerKey: ${providerKey}`);
        return;
    }
    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) {
        console.error(`KeySwitcher: Failed to get secrets during rotation for ${provider.name}`);
        return;
    }
    const data = loadSetData(provider, loadedSecrets);
    // Check if switching is enabled (safety check)
    if (!keySwitchingEnabled[provider.secret_key]) {
        console.log(`KeySwitcher: Rotation skipped for ${provider.name}, switching is disabled (called via handleKeyRotation).`);
        return; // Don't rotate if main toggle is off
    }
    const activeSetIndex = data.activeSetIndex;
    const activeSet = data.sets[activeSetIndex];
    if (!activeSet) {
        console.error(`KeySwitcher: Active set index ${activeSetIndex} invalid for ${provider.name}. Cannot rotate.`);
        return;
    }
    const keysInActiveSet = splitKeys(activeSet.keys);
    if (keysInActiveSet.length <= 1) {
        console.log(`KeySwitcher: Rotation skipped for ${provider.name} (Set: ${activeSet.name}). Not enough keys (${keysInActiveSet.length}).`);
        if (keysInActiveSet.length === 1) {
             const currentActiveKey = await secretsFunctions.findSecret(provider.secret_key);
             if (currentActiveKey !== keysInActiveSet[0]) {
                 console.log(`KeySwitcher: Setting the single available key for ${provider.name} (Set: ${activeSet.name}) as active.`);
                 await secretsFunctions.writeSecret(provider.secret_key, keysInActiveSet[0]);
                 secrets.secret_state[provider.secret_key] = true; // Update global state
                 secretsFunctions.updateSecretDisplay();
             }
        } else { // Zero keys
            const currentActiveKey = await secretsFunctions.findSecret(provider.secret_key);
            if (currentActiveKey) {
                console.log(`KeySwitcher: Active set '${activeSet.name}' for ${provider.name} is empty. Clearing active key.`);
                await secretsFunctions.writeSecret(provider.secret_key, "");
                secrets.secret_state[provider.secret_key] = false;
                 secretsFunctions.updateSecretDisplay();
            }
        }
        await updateProviderInfoPanel(provider, data);
        return;
    }
    const currentKey = await secretsFunctions.findSecret(provider.secret_key) || "";
    let newKey = "";
    const currentKeyIndexInSet = keysInActiveSet.indexOf(currentKey);
    if (currentKeyIndexInSet !== -1) {
        const nextKeyIndex = (currentKeyIndexInSet + 1) % keysInActiveSet.length;
        newKey = keysInActiveSet[nextKeyIndex];
    } else {
        console.log(`KeySwitcher: Current key '${currentKey}' not found in active set '${activeSet.name}' for ${provider.name}. Using first key.`);
        newKey = keysInActiveSet[0];
    }
    if (newKey && newKey !== currentKey) {
        console.log(`KeySwitcher: Rotating key for ${provider.name} (Set: ${activeSet.name}). From: '${currentKey || "N/A"}' To: '${newKey}'`);
        await secretsFunctions.writeSecret(provider.secret_key, newKey);
        secrets.secret_state[provider.secret_key] = !!newKey;
        secretsFunctions.updateSecretDisplay();
        await updateProviderInfoPanel(provider, data);
        const mainInput = document.getElementById(provider.input_id);
        if (mainInput) {
            mainInput.value = newKey;
        }
    } else {
         console.log(`KeySwitcher: Rotation check for ${provider.name} (Set: ${activeSet.name}). No change needed. Current key: '${currentKey || "N/A"}'`);
         await updateProviderInfoPanel(provider, data);
    }
}

/**
 * Handles the removal of a specific key from the currently active set for a provider.
 * Typically called when an API error indicates the key is invalid and preferences dictate removal.
 *
 * @param {object} provider The provider object from PROVIDERS.
 * @param {string} failedKey The API key that failed and should be removed.
 * @param {string} reason A description of why the key was removed (e.g., error message/code).
 * @returns {Promise<string|null>} The new key activated after removal, or null if no key was removed/no other keys are available.
 */
// --- Recycle Bin Utilities ---
function getRecycleBinKey(provider) {
    return `keyswitcher_recycle_bin_${provider.secret_key}`;
}
function loadRecycleBin(provider) {
    try {
        return JSON.parse(localStorage.getItem(getRecycleBinKey(provider))) || [];
    } catch { return []; }
}
function saveRecycleBin(provider, bin) {
    localStorage.setItem(getRecycleBinKey(provider), JSON.stringify(bin));
}

async function handleKeyRemoval(provider, failedKey, reason = "Unknown") {
    console.log(`KeySwitcher: Attempting removal of key '${failedKey}' for ${provider.name}. Reason: ${reason}`);

    // Check if switching/removal is actually enabled globally first
     if (!keySwitchingEnabled[provider.secret_key]) {
        console.log(`KeySwitcher: Removal skipped for ${provider.name}, auto switching/removal is disabled.`);
        return null; // Don't remove if main toggle is off
    }

    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) {
        console.error(`KeySwitcher: Failed to get secrets during key removal for ${provider.name}. Aborting removal.`);
        return null;
    }
    let data = loadSetData(provider, loadedSecrets);
    const activeSetIndex = data.activeSetIndex;
    const activeSet = data.sets[activeSetIndex];
    if (!activeSet) {
        console.error(`KeySwitcher: Active set index ${activeSetIndex} invalid for ${provider.name}. Cannot remove key.`);
        return null;
    }
    let keysInActiveSet = splitKeys(activeSet.keys);
    const failedKeyIndex = keysInActiveSet.indexOf(failedKey);
    if (failedKeyIndex === -1) {
        console.warn(`KeySwitcher: Failed key '${failedKey}' not found in the list of keys for active set '${activeSet.name}' (${provider.name}). Key not removed from storage.`);
        return null;
    }

    console.log(`KeySwitcher: Found key '${failedKey}' at index ${failedKeyIndex} in active set '${activeSet.name}'. Removing...`);
    const recycleBin = loadRecycleBin(provider);
    recycleBin.push({
        key: failedKey,
        set: activeSet.name,
        reason,
        removedAt: new Date().toISOString()
    });
    saveRecycleBin(provider, recycleBin);
    keysInActiveSet.splice(failedKeyIndex, 1);
    data.sets[activeSetIndex].keys = keysInActiveSet.join('\n');
    try {
        await saveSetData(provider, data);
        console.log(`KeySwitcher: Successfully saved updated key list for set '${activeSet.name}' after removing '${failedKey}'.`);
    } catch (error) {
        console.error(`KeySwitcher: Failed to save updated set data for ${provider.name} after key removal. Error:`, error);
        return null;
    }

    let newKeyToActivate = null;
    if (keysInActiveSet.length > 0) {
        const nextKeyIndex = failedKeyIndex % keysInActiveSet.length;
        newKeyToActivate = keysInActiveSet[nextKeyIndex];
        console.log(`KeySwitcher: Activating next key at index ${nextKeyIndex}: '${newKeyToActivate}'`);
    } else {
        newKeyToActivate = "";
        console.log(`KeySwitcher: Active set '${activeSet.name}' is now empty after removing the last key.`);
    }

    const currentActiveKey = await secretsFunctions.findSecret(provider.secret_key);
    if (currentActiveKey !== newKeyToActivate) {
         await secretsFunctions.writeSecret(provider.secret_key, newKeyToActivate);
         secrets.secret_state[provider.secret_key] = !!newKeyToActivate;
         secretsFunctions.updateSecretDisplay();
         console.log(`KeySwitcher: Updated active key for ${provider.name} to '${newKeyToActivate || "N/A"}'.`);
         const mainInput = document.getElementById(provider.input_id);
         if (mainInput) mainInput.value = newKeyToActivate;
    } else {
        console.log(`KeySwitcher: The key to activate (${newKeyToActivate || "N/A"}) is already the active key. No change needed to main secret.`);
        secrets.secret_state[provider.secret_key] = !!newKeyToActivate;
        secretsFunctions.updateSecretDisplay();
    }

    await updateProviderInfoPanel(provider, data);
    await redrawProviderUI(provider, data); // Ensure UI reflects removal + recycle bin update
    return newKeyToActivate;
}


// Get secrets from the server
async function getSecrets() {
    try {
        const response = await fetch("/api/secrets/view", {
            method: "POST",
            headers: scriptFunctions.getRequestHeaders(),
        });
        if (!response.ok) {
            console.error(`KeySwitcher: Failed to fetch secrets, status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("KeySwitcher: Error fetching secrets:", error);
        return null;
    }
}

// --- Info Panel Update Function ---
async function updateProviderInfoPanel(provider, data) {
    const getText = (selectorId) => { // Not used, but kept from original
        const element = document.getElementById(selectorId);
        return element ? element.textContent : 'Element not found!';
    };
    const activeSetDiv = document.getElementById(`active_set_info_${provider.secret_key}`);
    if (activeSetDiv) {
        const activeSetName = data.sets[data.activeSetIndex]?.name || "Unknown Set";
        activeSetDiv.textContent = `Active Set: ${activeSetName} (Set #${data.activeSetIndex})`;
    } else console.warn(`KeySwitcher: Could not find activeSetDiv for ${provider.name}`);
    const currentKeyDiv = document.getElementById(`current_key_${provider.secret_key}`);
    if (currentKeyDiv) {
        const currentActiveKeyValue = await secretsFunctions.findSecret(provider.secret_key);
        currentKeyDiv.textContent = `Current Key: ${currentActiveKeyValue ? currentActiveKeyValue : 'N/A'}`;
    } else console.warn(`KeySwitcher: Could not find currentKeyDiv for ${provider.name}`);
    const switchStatusDiv = document.getElementById(`switch_key_${provider.secret_key}`);
    if (switchStatusDiv) {
        switchStatusDiv.textContent = `Switching: ${keySwitchingEnabled[provider.secret_key] ? "On" : "Off"}`;
    } else console.warn(`KeySwitcher: Could not find switchStatusDiv for ${provider.name}`);
    const errorToggleDiv = document.getElementById(`show_${provider.secret_key}_error`);
    if (errorToggleDiv) {
        errorToggleDiv.textContent = `Error Details: ${showErrorDetails[provider.secret_key] ? "On" : "Off"}`;
    } else console.warn(`KeySwitcher: Could not find errorToggleDiv for ${provider.name}`);
}

/**
 * Redraws the dynamic UI section for managing key sets AND error code actions for a specific provider.
 *
 * @param {object} provider The provider object from PROVIDERS.
 * @param {object} data The current structured key set data object for this provider (from loadSetData).
 */
async function redrawProviderUI(provider, data) {
    const dynamicContainerId = `keyswitcher-sets-dynamic-${provider.secret_key}`;
    const dynamicContainer = document.getElementById(dynamicContainerId);
    if (!dynamicContainer) {
        console.error(`KeySwitcher: Dynamic container not found for ${provider.name} (ID: ${dynamicContainerId})`);
        return;
    }
    dynamicContainer.innerHTML = ''; // Clear previous dynamic content (sets + error table)

    // --- 1. Recycle Bin UI ---
    const recycleBinSection = document.createElement("div");
    recycleBinSection.id = `keyswitcher-recycle-bin-${provider.secret_key}`; // Unique ID
    recycleBinSection.style.marginBottom = "18px";
    recycleBinSection.style.padding = "8px";
    recycleBinSection.style.border = "1px dashed #b44";
    recycleBinSection.style.borderRadius = "4px";
    recycleBinSection.style.background = "#2a1818";

    const recycleHeader = document.createElement("div");
    recycleHeader.style.display = "flex";
    recycleHeader.style.justifyContent = "space-between";
    recycleHeader.style.alignItems = "center";
    recycleHeader.style.cursor = "pointer";
    recycleHeader.style.fontWeight = "bold";
    recycleHeader.textContent = "🗑️ Recycle Bin (Removed Keys)";
    recycleHeader.title = "Click to collapse/expand";
    recycleBinSection.appendChild(recycleHeader);

    const collapseKey = `keyswitcher-recycle-collapsed-${provider.secret_key}`;
    let recycleCollapsed = localStorage.getItem(collapseKey) !== 'false';
    const binContent = document.createElement("div");
    binContent.style.display = recycleCollapsed ? "none" : "block";
    recycleHeader.onclick = () => {
        recycleCollapsed = !recycleCollapsed;
        localStorage.setItem(collapseKey, recycleCollapsed);
        binContent.style.display = recycleCollapsed ? "none" : "block";
    };
    recycleBinSection.appendChild(binContent);

    const recycleBin = loadRecycleBin(provider);
    if (recycleBin.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "Recycle bin is empty.";
        empty.style.fontStyle = "italic";
        binContent.appendChild(empty);
    } else {
        // Sort bin reverse chronologically (newest first)
        recycleBin.sort((a, b) => new Date(b.removedAt) - new Date(a.removedAt));

        recycleBin.forEach((entry, binIndex) => { // Use binIndex for restoring/deleting correct item
            const row = document.createElement("div");
             row.style.display = "flex";
            row.style.flexDirection = "column"; // Stack vertically
            row.style.borderBottom = "1px solid #a44";
            row.style.padding = "5px 0";
            row.style.marginBottom = "5px"; // Space between entries

            const keyRow = document.createElement("div");
            keyRow.textContent = entry.key;
            keyRow.style.wordBreak = "break-all";
            keyRow.style.fontSize = "0.95em";
            keyRow.style.background = "#1a1a1a";
            keyRow.style.color = "#e0c0c0";
            keyRow.style.padding = "2px 6px";
            keyRow.style.marginBottom = "3px";
            keyRow.style.borderRadius = "3px";
            row.appendChild(keyRow);

            const meta = document.createElement("div");
            meta.style.fontSize = "0.85em";
            meta.style.color = "#b88";
            meta.textContent =
                `Set: ${entry.set || 'N/A'} | Reason: ${entry.reason || 'N/A'} | Removed: ${new Date(entry.removedAt).toLocaleString()}`;
            row.appendChild(meta);

            const btnRow = document.createElement("div");
            btnRow.style.display = "flex";
            btnRow.style.gap = "8px";
            btnRow.style.marginTop = "4px";
            const restoreBtn = createButton("Restore", async () => {
                const loadedSecrets = await getSecrets();
                const currentData = loadSetData(provider, loadedSecrets);
                let setIdx = currentData.sets.findIndex(s => s.name === entry.set);

                // If original set doesn't exist, prompt user or add to active set?
                // For now, let's try adding to the *currently active* set if original is gone.
                if (setIdx === -1) {
                    console.warn(`KeySwitcher: Original set '${entry.set}' not found for restoring key. Adding to active set '${currentData.sets[currentData.activeSetIndex].name}'.`);
                    setIdx = currentData.activeSetIndex;
                     if (setIdx === -1 || setIdx >= currentData.sets.length) { // Safety check if active index is somehow invalid
                         alert("Restore failed: Could not find original set and no valid active set exists.");
                         return;
                     }
                }

                // Append key to the target set's keys string
                currentData.sets[setIdx].keys += (currentData.sets[setIdx].keys ? "\n" : "") + entry.key;
                await saveSetData(provider, currentData);

                // Remove from bin
                let currentBin = loadRecycleBin(provider);
                // Find the *actual* index in the potentially sorted bin display vs original bin file order
                const actualBinIndex = currentBin.findIndex(item => item.key === entry.key && item.removedAt === entry.removedAt);
                if(actualBinIndex > -1) {
                    currentBin.splice(actualBinIndex, 1);
                    saveRecycleBin(provider, currentBin);
                } else {
                    console.warn("KeySwitcher: Could not find exact item in recycle bin for removal after restore.");
                }

                localStorage.setItem(collapseKey, 'false'); // Keep bin open
                await redrawProviderUI(provider, currentData); // Redraw with updated bin and set
                await updateProviderInfoPanel(provider, currentData); // Reflect potential key change if active set was modified
                 toastr.success(`Key '${entry.key.substring(0, 8)}...' restored to set '${currentData.sets[setIdx].name}'.`);
            });
            btnRow.appendChild(restoreBtn);

            const deleteBtn = createButton("Delete Permanently", () => {
                if (confirm(`Are you sure you want to permanently delete the key "${entry.key}" from the recycle bin?`)) {
                    let currentBin = loadRecycleBin(provider);
                     const actualBinIndex = currentBin.findIndex(item => item.key === entry.key && item.removedAt === entry.removedAt);
                     if(actualBinIndex > -1) {
                        currentBin.splice(actualBinIndex, 1);
                        saveRecycleBin(provider, currentBin);
                     } else {
                        console.warn("KeySwitcher: Could not find exact item in recycle bin for permanent deletion.");
                     }

                    localStorage.setItem(collapseKey, 'false'); // Keep bin open
                    redrawProviderUI(provider, data); // Redraw (data hasn't changed, just the bin)
                }
            });
            btnRow.appendChild(deleteBtn);
            row.appendChild(btnRow);

            binContent.appendChild(row);
        });
    }
    dynamicContainer.appendChild(recycleBinSection); // Add bin to the dynamic section

    // --- 2. Key Sets Area ---
    const setsAreaHeader = document.createElement("h5");
    setsAreaHeader.textContent = "Key Sets Management:";
    setsAreaHeader.style.marginTop = "15px";
    setsAreaHeader.style.marginBottom = "5px";
    dynamicContainer.appendChild(document.createElement("hr"));
    dynamicContainer.appendChild(setsAreaHeader);

    if (!data.sets || data.sets.length === 0) {
        const noSetsMessage = document.createElement('p');
        noSetsMessage.textContent = "No key sets defined. Click 'Add New Set' to create one.";
        noSetsMessage.style.fontStyle = "italic";
        dynamicContainer.appendChild(noSetsMessage);
    } else {
        data.sets.forEach((set, index) => {
            const setContainer = document.createElement("div");
            setContainer.classList.add("keyswitcher-set-item");
            setContainer.style.border = "1px solid #555";
            setContainer.style.borderRadius = "4px";
            setContainer.style.padding = "10px";
            setContainer.style.marginBottom = "10px";
            if (index === data.activeSetIndex) {
                setContainer.style.borderColor = "#8cff7a";
                setContainer.style.boxShadow = "0 0 5px #8cff7a";
            }

            const setHeader = document.createElement("div");
            setHeader.style.display = "flex";
            setHeader.style.justifyContent = "space-between";
            setHeader.style.alignItems = "center";
            setHeader.style.marginBottom = "8px";

            const setNameInput = document.createElement("input"); // Use input for renaming
            setNameInput.type = "text";
            setNameInput.value = set.name;
            setNameInput.style.fontWeight = "bold";
            setNameInput.style.border = "none";
            setNameInput.style.background = "transparent";
            setNameInput.style.color = "inherit";
            setNameInput.style.flexGrow = "1"; // Allow it to take space
            setNameInput.title = "Click to edit name, press Enter or click away to save";
             if (index === data.activeSetIndex) {
                setNameInput.value += ' (Active)';
                setNameInput.readOnly = true; // Display "(Active)" but don't allow editing it directly
                setNameInput.style.fontStyle = "italic"; // Visually distinguish active state text
                 setNameInput.title = "Set Name (Active)"; // Update title
             } else {
                 setNameInput.onchange = async (e) => { // Save on change (blur or Enter)
                     const newName = e.target.value.trim();
                     if (newName && newName !== set.name) {
                         // Check for duplicate names
                         if (data.sets.some((s, i) => i !== index && s.name === newName)) {
                             alert(`Set name "${newName}" already exists. Please choose a unique name.`);
                             e.target.value = set.name; // Revert input
                         } else {
                             console.log(`KeySwitcher: Renaming set ${index} from '${set.name}' to '${newName}' for ${provider.name}`);
                             data.sets[index].name = newName;
                             await saveSetData(provider, data);
                             // Redraw needed only if name affects recycle bin entries (it does) or if active status changes (it doesn't)
                             // Let's redraw just to be safe and update potential bin entries
                             const updatedSecrets = await getSecrets();
                             if (updatedSecrets) {
                                const updatedData = loadSetData(provider, updatedSecrets);
                                // No need to rotate or update info panel just for rename
                                await redrawProviderUI(provider, updatedData);
                             }
                         }
                     } else {
                         e.target.value = set.name; // Revert if empty or unchanged
                     }
                 };
             }


            const setButtons = document.createElement("div");
            setButtons.style.display = "flex";
            setButtons.style.gap = "5px";
            setButtons.style.marginLeft = "10px"; // Space between name and buttons

            if (index !== data.activeSetIndex) {
                const activateButton = createButton("Activate Set", async () => {
                    console.log(`KeySwitcher: Activating set ${index} ('${set.name}') for ${provider.name}`);
                    data.activeSetIndex = index;
                    await saveSetData(provider, data);
                    await handleKeyRotation(provider.secret_key); // Use first/next key of newly active set
                    const updatedSecrets = await getSecrets();
                    if (updatedSecrets) {
                        const updatedData = loadSetData(provider, updatedSecrets);
                        await updateProviderInfoPanel(provider, updatedData);
                        await redrawProviderUI(provider, updatedData);
                    }
                });
                setButtons.appendChild(activateButton);
            }

            const deleteButton = createButton("Delete Set", async () => {
                 if (confirm(`Are you sure you want to delete the key set "${set.name}"? This CANNOT be undone. Associated keys will NOT be moved to the recycle bin.`)) {
                    console.log(`KeySwitcher: Deleting set ${index} ('${set.name}') for ${provider.name}`);
                    const deletedSetName = data.sets[index].name; // Get name before deleting
                    data.sets.splice(index, 1);

                    // Adjust activeSetIndex
                    if (data.activeSetIndex === index) {
                        data.activeSetIndex = 0;
                    } else if (data.activeSetIndex > index) {
                        data.activeSetIndex--;
                    }
                     if (data.sets.length === 0) {
                        data.sets.push({ name: "Default", keys: "" });
                        data.activeSetIndex = 0;
                    }

                    await saveSetData(provider, data);
                    // Optionally: Clear associated entries from recycle bin? NO - keep them for history.

                    const updatedSecrets = await getSecrets();
                    if (updatedSecrets) {
                        const updatedData = loadSetData(provider, updatedSecrets);
                        await handleKeyRotation(provider.secret_key); // Rotate for the new active set
                        await updateProviderInfoPanel(provider, updatedData);
                        await redrawProviderUI(provider, updatedData);
                    }
                 }
            });
            if (data.sets.length <= 1) {
                deleteButton.disabled = true;
                deleteButton.title = "Cannot delete the only set.";
                deleteButton.style.opacity = "0.5";
                deleteButton.style.cursor = "not-allowed";
            }
            setButtons.appendChild(deleteButton);

            setHeader.appendChild(setNameInput); // Use the input element
            setHeader.appendChild(setButtons);
            setContainer.appendChild(setHeader);

            const keysTextarea = document.createElement("textarea");
            keysTextarea.classList.add("text_pole", "api_key_textarea");
            keysTextarea.rows = 4;
            keysTextarea.placeholder = `Enter API keys for set "${set.name}", one per line or separated by semicolons.`;
            keysTextarea.value = set.keys || "";
            keysTextarea.style.width = "100%";
            keysTextarea.style.boxSizing = 'border-box';

            keysTextarea.addEventListener('blur', async (event) => {
                const newKeys = event.target.value.trim();
                // Compare arrays to handle whitespace/empty line differences correctly
                const oldKeyArray = splitKeys(set.keys);
                const newKeyArray = splitKeys(newKeys);
                if (JSON.stringify(oldKeyArray) !== JSON.stringify(newKeyArray)) {
                    console.log(`KeySwitcher: Updating keys for set ${index} ('${set.name}') for ${provider.name}`);
                    data.sets[index].keys = newKeyArray.join('\n'); // Save consistently with newlines
                    await saveSetData(provider, data);
                    if (index === data.activeSetIndex) {
                         console.log("KeySwitcher: Keys updated for the active set. Triggering rotation check.");
                        await handleKeyRotation(provider.secret_key);
                    }
                } else {
                    // Even if keys haven't changed, normalize the value in the textarea
                    event.target.value = newKeyArray.join('\n');
                }
            });

            setContainer.appendChild(keysTextarea);
            dynamicContainer.appendChild(setContainer);
        });
    }

    const addNewSetButton = createButton("Add New Set", async () => {
        let newSetName = prompt("Enter a name for the new key set:", `Set ${data.sets.length + 1}`);
        if (newSetName) {
             newSetName = newSetName.trim();
             if (newSetName) {
                 // Check for duplicate names before adding
                 if (data.sets.some(s => s.name === newSetName)) {
                     alert(`Set name "${newSetName}" already exists. Please choose a unique name.`);
                     return; // Don't add duplicate
                 }
                 console.log(`KeySwitcher: Adding new set named '${newSetName}' for ${provider.name}`);
                 data.sets.push({ name: newSetName, keys: "" });
                 await saveSetData(provider, data);
                 const updatedSecrets = await getSecrets();
                  if (updatedSecrets) {
                      const updatedData = loadSetData(provider, updatedSecrets);
                      await redrawProviderUI(provider, updatedData); // Redraw to show the new set
                  }
             } else {
                 alert("Set name cannot be empty.");
             }
        } // No alert if prompt was cancelled (null)
    });
    addNewSetButton.style.marginTop = "10px";
    dynamicContainer.appendChild(addNewSetButton);

    // --- 3. Error Code Actions UI ---
    const errorActionsSection = document.createElement("div");
    errorActionsSection.id = `keyswitcher-error-actions-${provider.secret_key}`;
    errorActionsSection.style.marginTop = "15px";
    errorActionsSection.style.border = "1px solid #668"; // Different color for distinction
    errorActionsSection.style.borderRadius = "4px";
    errorActionsSection.style.padding = "10px";

    const errorActionsHeader = document.createElement("div");
    errorActionsHeader.style.cursor = "pointer";
    errorActionsHeader.style.fontWeight = "bold";
    errorActionsHeader.style.marginBottom = "8px";
    errorActionsHeader.title = "Click to collapse/expand Error Actions";

    const errorCollapseKey = `keyswitcher-error-actions-collapsed-${provider.secret_key}`;
    let errorCollapsed = localStorage.getItem(errorCollapseKey) !== 'false'; // Default collapsed

    const errorChevron = document.createElement("span");
    errorChevron.textContent = errorCollapsed ? "▶ " : "▼ ";
    errorChevron.style.fontSize = "14px";
    errorActionsHeader.appendChild(errorChevron);
    errorActionsHeader.appendChild(document.createTextNode("Error Code Actions")); // Use text node

    const errorContent = document.createElement("div");
    errorContent.style.display = errorCollapsed ? "none" : "block";
    errorContent.style.marginTop = "5px";

    errorActionsHeader.onclick = () => {
        errorCollapsed = !errorCollapsed;
        localStorage.setItem(errorCollapseKey, errorCollapsed);
        errorContent.style.display = errorCollapsed ? "none" : "block";
        errorChevron.textContent = errorCollapsed ? "▶ " : "▼ ";
    };

    errorActionsSection.appendChild(errorActionsHeader);
    errorActionsSection.appendChild(errorContent);


    // Load current preferences
    const errorPrefs = loadErrorCodePrefs(provider);
    const providerCodes = PROVIDER_ERROR_MAPPINGS[provider.secret_key]?.codes;

    if (!providerCodes || Object.keys(providerCodes).length === 0) {
        errorContent.textContent = "No specific error codes defined for this provider.";
    } else {
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const thAction = document.createElement("th");
        thAction.textContent = "Action";
        thAction.style.textAlign = "left";
        thAction.style.padding = "4px";
        headerRow.appendChild(thAction);

        Object.keys(providerCodes).sort().forEach(code => { // Sort codes for consistent order
            const thCode = document.createElement("th");
            thCode.textContent = code;
            thCode.title = providerCodes[code]; // Show description on hover
            thCode.style.padding = "4px";
            thCode.style.border = "1px solid #555";
            headerRow.appendChild(thCode);
        });

        const tbody = table.createTBody();
        const actions = ['Rotate', 'Remove'];

        actions.forEach(actionName => {
            const row = tbody.insertRow();
            const cellAction = row.insertCell();
            cellAction.textContent = actionName;
            cellAction.style.fontWeight = "bold";
            cellAction.style.padding = "4px";
            cellAction.style.border = "1px solid #555";

            Object.keys(providerCodes).sort().forEach(code => {
                const cell = row.insertCell();
                cell.style.textAlign = "center";
                cell.style.border = "1px solid #555";
                cell.style.padding = "4px";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.dataset.action = actionName.toLowerCase(); // 'rotate' or 'remove'
                checkbox.dataset.code = code;
                checkbox.title = `${actionName} key on error ${code}`;
                 checkbox.checked = errorPrefs[code] === actionName.toLowerCase();

                checkbox.addEventListener('change', (event) => {
                    const currentAction = event.target.dataset.action;
                    const currentCode = event.target.dataset.code;
                    const isChecked = event.target.checked;
                    const currentPrefs = loadErrorCodePrefs(provider); // Load fresh prefs

                    if (isChecked) {
                        // Set this action for the code
                        currentPrefs[currentCode] = currentAction;
                        // Uncheck the *other* action's checkbox in the same column
                        const otherAction = currentAction === 'rotate' ? 'remove' : 'rotate';
                        const otherCheckbox = table.querySelector(`input[data-action='${otherAction}'][data-code='${currentCode}']`);
                        if (otherCheckbox) {
                            otherCheckbox.checked = false;
                        }
                    } else {
                        // If unchecked, set action to 'none'
                        currentPrefs[currentCode] = 'none';
                    }

                    saveErrorCodePrefs(provider, currentPrefs);
                     // Maybe add a small visual confirmation? (e.g., brief background flash)
                });

                cell.appendChild(checkbox);
            });
        });

        errorContent.appendChild(table);
         const helpText = document.createElement("p");
         helpText.style.fontSize = "0.9em";
         helpText.style.color = "#aaa";
         helpText.style.marginTop = "8px";
         helpText.innerHTML = "Select the desired action (Rotate Key or Remove Key) for each HTTP status code. Only one action can be selected per code. If neither is checked, no automatic action will be taken for that error code, even if 'Auto Switching/Removal' is enabled globally. Changes are saved automatically.";
         errorContent.appendChild(helpText);

    }
    dynamicContainer.appendChild(errorActionsSection); // Add error section below sets/add button
}


// --- Main Initialization Logic ---
jQuery(async () => {
    console.log("MultiProviderKeySwitcher: Initializing...");

    // Override toastr.error to intercept API errors
    const originalToastrError = toastr.error;
    toastr.error = async function(...args) {
        originalToastrError(...args); // Show original toast first
        console.log("KeySwitcher: Toastr Error Args:", args);
        const [errorMessage, errorTitle] = args;

        for (const provider of Object.values(PROVIDERS)) {
            if (isProviderSource(provider)) {
                console.log(`KeySwitcher: Error occurred while ${provider.name} was active.`);
                let keyRemoved = false;
                let removedKeyValue = null;
                const failedKey = await secretsFunctions.findSecret(provider.secret_key);
                let statusCode = null;
                const statusCodeMatch = errorMessage.match(/\b(\d{3})\b/);
                if (statusCodeMatch) statusCode = parseInt(statusCodeMatch[1], 10);

                // Only proceed with key actions if the global toggle is ON
                if (failedKey && keySwitchingEnabled[provider.secret_key]) {
                    if (statusCode) {
                        const action = getErrorCodeAction(provider, statusCode);
                         console.log(`KeySwitcher: Status code ${statusCode} detected. Configured action: ${action}`);

                        if (action === 'remove') {
                            console.log(`KeySwitcher: Configured action is 'remove'. Attempting removal...`);
                            let removalReason = `Status code ${statusCode}`;
                            try { // Try to get more detail
                                const jsonMatch = errorMessage.match(/({.*})/);
                                if (jsonMatch && jsonMatch[1]) {
                                    const parsed = JSON.parse(jsonMatch[1]);
                                    if (parsed?.error?.message) removalReason = `${statusCode}: ${parsed.error.message}`;
                                }
                            } catch {} // Ignore parsing errors
                            const newKey = await handleKeyRemoval(provider, failedKey, removalReason);
                            if (newKey !== null) {
                                keyRemoved = true;
                                removedKeyValue = failedKey;
                                console.log(`KeySwitcher: Key removal successful based on action '${action}'. New key: ${newKey}`);
                            } else {
                                console.log(`KeySwitcher: handleKeyRemoval returned null/failed during action '${action}'.`);
                            }
                        } else if (action === 'rotate') {
                            console.log(`KeySwitcher: Configured action is 'rotate'. Rotating key...`);
                            await handleKeyRotation(provider.secret_key);
                        } else {
                            console.log(`KeySwitcher: Configured action is 'none'. No automatic key action taken.`);
                        }
                    } else {
                        // No status code found in the error message
                        // Optional: Could potentially fall back to regex check here, but let's keep it simple first.
                        console.log(`KeySwitcher: No status code found in error message. No key action taken. Consider configuring actions if applicable codes are known but not parsed.`);
                       // console.log(`KeySwitcher: No status code found. Falling back to standard rotation (if enabled).`);
                       // await handleKeyRotation(provider.secret_key); // Fallback? Or do nothing? Let's do nothing.
                    }
                } else if (failedKey) {
                    console.log(`KeySwitcher: Error occurred for ${provider.name}, but 'Auto Switching/Removal' is OFF. No key action taken.`);
                } else {
                    console.log(`KeySwitcher: Error occurred for ${provider.name}, but no failed key was found in secrets.`);
                }

                // Show detailed popup if enabled, regardless of action taken
                if (showErrorDetails[provider.secret_key]) {
                    showErrorPopup(provider, errorMessage, errorTitle || `${provider.name} API Error`, keyRemoved, removedKeyValue);
                }
                break; // Exit loop once the active provider is found and handled
            }
        }
    }; // End of toastr.error override

    // Get initial secrets
    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) {
        console.error("KeySwitcher: Failed to load secrets on initial load. UI setup aborted.");
        toastr.error("KeySwitcher: Failed to load secrets. Key management UI disabled.", "Initialization Error");
        return;
    }
    await init(loadedSecrets); // Call original init (currently does nothing)

    // Process each provider - Setup UI
    for (const provider of Object.values(PROVIDERS)) {
        console.log(`KeySwitcher: Processing provider UI for: ${provider.name}`);
        const formElement = provider.get_form();
        console.log(`KeySwitcher: >>> Result of get_form() for ${provider.name}:`, formElement);

        if (formElement) {
            if (formElement.querySelector(`#keyswitcher-main-${provider.secret_key}`)) {
                console.log(`KeySwitcher: UI already exists for ${provider.name}. Forcing update...`);
                 try {
                     const data = loadSetData(provider, loadedSecrets);
                     await updateProviderInfoPanel(provider, data);
                     await redrawProviderUI(provider, data); // Also redraw dynamic part
                 } catch (updateError) {
                     console.error(`KeySwitcher: Error updating existing UI for ${provider.name}`, updateError);
                 }
                continue; // Skip injection if already present
            }

            try {
                const data = loadSetData(provider, loadedSecrets);
                console.log(`KeySwitcher: ${provider.name} initial set data:`, JSON.parse(JSON.stringify(data)));

                const topLevelContainer = document.createElement("div");
                topLevelContainer.id = `keyswitcher-main-${provider.secret_key}`;
                topLevelContainer.classList.add("keyswitcher-provider-container");
                topLevelContainer.style.marginTop = "15px";
                topLevelContainer.style.border = "1px solid #444";
                topLevelContainer.style.padding = "10px";
                topLevelContainer.style.borderRadius = "5px";

                const collapsedKey = `keyswitcher_collapsed_${provider.secret_key}`;
                let isCollapsed = localStorage.getItem(collapsedKey) === "true";
                const headerBar = document.createElement("div");
                headerBar.style.display = "flex";
                headerBar.style.alignItems = "center";
                headerBar.style.cursor = "pointer";
                headerBar.style.userSelect = "none";
                headerBar.style.marginBottom = "8px";
                headerBar.style.gap = "8px";

                const chevron = document.createElement("span");
                chevron.textContent = isCollapsed ? "▶" : "▼";
                chevron.style.fontSize = "18px";
                chevron.style.transition = "transform 0.2s";
                chevron.style.marginRight = "4px";

                const heading = document.createElement("h4");
                heading.textContent = `${provider.name} - Key Set Manager`;
                heading.style.margin = "0";
                heading.style.flex = "1";
                heading.style.fontWeight = "bold";

                headerBar.appendChild(chevron);
                headerBar.appendChild(heading);
                topLevelContainer.appendChild(headerBar);

                const collapsibleContent = document.createElement("div");
                collapsibleContent.id = `keyswitcher-content-${provider.secret_key}`; // Give content an ID
                collapsibleContent.style.display = isCollapsed ? "none" : "block";

                headerBar.addEventListener("click", () => {
                    isCollapsed = !isCollapsed;
                    collapsibleContent.style.display = isCollapsed ? "none" : "block";
                    chevron.textContent = isCollapsed ? "▶" : "▼";
                    localStorage.setItem(collapsedKey, isCollapsed ? "true" : "false");
                });

                const infoPanel = document.createElement("div");
                infoPanel.id = `keyswitcher-info-${provider.secret_key}`;
                infoPanel.style.marginBottom = "10px";
                infoPanel.style.padding = "8px";
                infoPanel.style.border = "1px dashed #666";
                infoPanel.style.borderRadius = "4px";
                const activeSetDiv = document.createElement("div"); activeSetDiv.id = `active_set_info_${provider.secret_key}`; activeSetDiv.textContent = "Active Set: Loading..."; infoPanel.appendChild(activeSetDiv);
                const currentKeyDiv = document.createElement("div");
                currentKeyDiv.id = `current_key_${provider.secret_key}`;
                currentKeyDiv.textContent = "Current Key: Loading...";
                currentKeyDiv.style.maxWidth = "100%";
                currentKeyDiv.style.wordBreak = "break-all";
                currentKeyDiv.style.display = "block";
                currentKeyDiv.style.margin = "4px 0";
                currentKeyDiv.style.padding = "2px 6px";
                currentKeyDiv.style.borderRadius = "3px";
                infoPanel.appendChild(currentKeyDiv);
                const switchStatusDiv = document.createElement("div"); switchStatusDiv.id = `switch_key_${provider.secret_key}`; switchStatusDiv.textContent = "Switching: Loading..."; infoPanel.appendChild(switchStatusDiv);
                const errorToggleDiv = document.createElement("div"); errorToggleDiv.id = `show_${provider.secret_key}_error`; errorToggleDiv.textContent = "Error Details: Loading..."; infoPanel.appendChild(errorToggleDiv);
                collapsibleContent.appendChild(infoPanel);

                const globalButtonContainer = document.createElement("div");
                globalButtonContainer.classList.add("key-switcher-buttons", "flex-container", "flex");
                globalButtonContainer.style.marginBottom = "10px";
                 globalButtonContainer.style.flexWrap = "wrap"; // Allow buttons to wrap
                globalButtonContainer.style.gap = "5px";

                const keySwitchingButton = createButton("Toggle Auto Switching/Removal", async () => {
                    keySwitchingEnabled[provider.secret_key] = !keySwitchingEnabled[provider.secret_key];
                    localStorage.setItem(`switch_key_${provider.secret_key}`, keySwitchingEnabled[provider.secret_key].toString());
                    const currentSecrets = await getSecrets() || {};
                    await updateProviderInfoPanel(provider, loadSetData(provider, currentSecrets));
                });
                const rotateManuallyButton = createButton("Rotate Key in Active Set Now", async () => {
                    console.log(`KeySwitcher: Manual rotation requested for ${provider.name}`);
                    await handleKeyRotation(provider.secret_key); // Should rotate even if auto-switch is off
                    // const currentSecrets = await getSecrets() || {}; // updateProviderInfoPanel called within handleKeyRotation now
                    // await updateProviderInfoPanel(provider, loadSetData(provider, currentSecrets));
                });
                const errorToggleButton = createButton("Toggle Error Details Popup", async () => {
                    showErrorDetails[provider.secret_key] = !showErrorDetails[provider.secret_key];
                    localStorage.setItem(`show_${provider.secret_key}_error`, showErrorDetails[provider.secret_key].toString());
                    const currentSecrets = await getSecrets() || {};
                    await updateProviderInfoPanel(provider, loadSetData(provider, currentSecrets));
                });

                 // const manageErrorActionsButton = createButton("Manage Error Actions", () => {
                 //     const errorSection = document.getElementById(`keyswitcher-error-actions-${provider.secret_key}`);
                 //     if (errorSection) {
                 //         // Find the header to simulate a click for toggling visibility
                 //         const errorHeader = errorSection.querySelector("div[style*='cursor: pointer']");
                 //         if (errorHeader) {
                 //             errorHeader.click(); // Toggle collapse/expand
                 //         } else { // Fallback: directly toggle content display
                 //            const errorContent = errorSection.querySelector("div[style*='display']"); // Find content div
                 //             if(errorContent) errorContent.style.display = errorContent.style.display === 'none' ? 'block' : 'none';
                 //         }
                 //          // Scroll into view if needed
                 //         errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                 //
                 //     } else {
                 //         console.warn("KeySwitcher: Could not find error actions section to toggle.");
                 //     }
                 // });


                globalButtonContainer.appendChild(keySwitchingButton);
                globalButtonContainer.appendChild(rotateManuallyButton);
                globalButtonContainer.appendChild(errorToggleButton);
                // globalButtonContainer.appendChild(manageErrorActionsButton); // Button is now part of redrawProviderUI header
                collapsibleContent.appendChild(globalButtonContainer);

                const dynamicSetsContainer = document.createElement("div");
                dynamicSetsContainer.id = `keyswitcher-sets-dynamic-${provider.secret_key}`;
                collapsibleContent.appendChild(dynamicSetsContainer);

                topLevelContainer.appendChild(collapsibleContent);

                console.log(`KeySwitcher: Attempting to inject UI for ${provider.name}`);
                const insertBeforeElement = formElement.querySelector('hr:not(.key-switcher-hr), button, .form_section_block');
                const separatorHr = document.createElement("hr");
                separatorHr.className = "key-switcher-hr";

                if (insertBeforeElement) {
                    formElement.insertBefore(separatorHr, insertBeforeElement);
                    formElement.insertBefore(topLevelContainer, insertBeforeElement);
                } else {
                    console.log(`KeySwitcher: No specific insert point found for ${provider.name}, appending.`);
                    formElement.appendChild(separatorHr);
                    formElement.appendChild(topLevelContainer);
                }
                console.log(`KeySwitcher: UI Injected successfully for ${provider.name}`);

                await updateProviderInfoPanel(provider, data);
                await redrawProviderUI(provider, data); // Draw dynamic parts (sets, error table)

            } catch (injectionError) {
                 console.error(`KeySwitcher: *** ERROR during UI creation/injection for ${provider.name}:`, injectionError);
                 console.error(`KeySwitcher: formElement at time of error was:`, formElement);
            }

        } else {
             console.warn(`KeySwitcher: Could not find form element for ${provider.name} (ID: ${provider.form_id}). Skipping UI injection.`);
        }
    } // --- End of provider loop ---

    // --- Event Listeners ---
     // Update relevant provider UI on model change IF the provider itself changes
     scriptFunctions.eventSource.on(scriptFunctions.event_types.CHATCOMPLETION_MODEL_CHANGED, async (model) => {
         console.log("KeySwitcher: Model changed event received.");
         try {
             const currentSecrets = await getSecrets() || {};
             for (const provider of Object.values(PROVIDERS)) {
                 // Check if this provider *is now* the active source
                 if (isProviderSource(provider)) {
                     console.log(`KeySwitcher: Active source is now ${provider.name}. Updating UI and potentially rotating.`);
                     const data = loadSetData(provider, currentSecrets);
                     await updateProviderInfoPanel(provider, data);
                     // Trigger rotation only if enabled
                     if (keySwitchingEnabled[provider.secret_key]) {
                        console.log(`KeySwitcher: Triggering rotation check for newly active provider ${provider.name}.`);
                        await handleKeyRotation(provider.secret_key);
                     }
                     // Ensure the dynamic UI is also up-to-date for this provider
                      await redrawProviderUI(provider, data);
                     break; // Found the new active provider
                 }
             }
         } catch (e) {
             console.error("KeySwitcher: Error during MODEL_CHANGED UI update:", e);
         }
     });

    // Initial rotation check when settings are ready
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHAT_COMPLETION_SETTINGS_READY, async () => {
        console.log("KeySwitcher: Chat completion settings ready, checking for initial key rotation...");
        try {
            // const currentSource = oaiFunctions.oai_settings.chat_completion_source; // Not needed directly
            const currentSecrets = await getSecrets() || {};
            for (const provider of Object.values(PROVIDERS)) {
                if (isProviderSource(provider)) {
                    console.log(`KeySwitcher: Initial active source is ${provider.name}.`);
                     const data = loadSetData(provider, currentSecrets);
                     // Always update panel and draw UI on load
                     await updateProviderInfoPanel(provider, data);
                     // Ensure dynamic UI is drawn even if switching is off
                     const contentContainer = document.getElementById(`keyswitcher-content-${provider.secret_key}`);
                     if (contentContainer && contentContainer.style.display !== 'none') { // Only redraw if visible
                        await redrawProviderUI(provider, data);
                     } else if (!contentContainer) { // Or if not drawn yet at all
                        await redrawProviderUI(provider, data);
                     }

                    if (keySwitchingEnabled[provider.secret_key]) {
                        console.log(`KeySwitcher: Switching enabled for ${provider.name}. Attempting initial key rotation/validation.`);
                        await handleKeyRotation(provider.secret_key); // Rotates/validates key
                    } else {
                         console.log(`KeySwitcher: Switching disabled for ${provider.name}.`);
                    }
                    break; // Found active provider
                }
            }
        } catch(e) {
            console.error("KeySwitcher: Error during SETTINGS_READY check:", e);
        }
    });

    console.log("MultiProviderKeySwitcher: Initialization complete.");
});


// Export the plugin's init function
export default init;
