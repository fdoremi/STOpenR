// @ts-nocheck
import * as script from "../../../../../script.js";
import * as secrets from "../../../../../scripts/secrets.js";
import * as oai from "../../../../../scripts/openai.js";
import * as popup from "../../../../../scripts/popup.js";
import { SECRET_KEYS } from "../../../../../scripts/secrets.js"; // Import SECRET_KEYS

// Module wrapper
var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
        return cachedModule.exports;
    }
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}

var __webpack_modules__ = {};

__webpack_modules__.d = (exports, definition) => {
    for (var key in definition) {
        if (__webpack_modules__.o(definition, key) && !__webpack_modules__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};

__webpack_modules__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));

// Actual module starts here
const exports = {};
__webpack_modules__.d(exports, { default: () => init });

// Import functions from SillyTavern's script.js
const scriptFunctions = {
    eventSource: script.eventSource,
    event_types: script.event_types,
    getRequestHeaders: script.getRequestHeaders,
    saveSettingsDebounced: script.saveSettingsDebounced
};

// Import functions from SillyTavern's secrets.js
const secretsFunctions = {
    updateSecretDisplay: secrets.updateSecretDisplay,
    writeSecret: secrets.writeSecret,
    findSecret: secrets.findSecret // Add findSecret
};

// Import settings from openai.js
const oaiFunctions = {
    oai_settings: oai.oai_settings
};

// Import popup functions
const popupFunctions = {
    POPUP_TYPE: popup.POPUP_TYPE,
    callGenericPopup: popup.callGenericPopup
};

// Provider sources and keys
const PROVIDERS = {
    OPENROUTER: {
        name: "OpenRouter",
        source_check: () => ["openrouter"].includes(oaiFunctions.oai_settings.chat_completion_source),
        secret_key: SECRET_KEYS.OPENROUTER,
        custom_key: "api_key_openrouter_custom",
        form_id: "openrouter_form",
        input_id: "api_key_openrouter", // Assumed, check INPUT_MAP if needed
        get_form: () => $("#openrouter_form")[0],
    },
    ANTHROPIC: {
        name: "Anthropic (Claude)",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'claude', // Standardize to chat_completion_source
        secret_key: SECRET_KEYS.CLAUDE,
        custom_key: "api_key_claude_custom",
        form_id: "claude_form",
        input_id: "api_key_claude",
        get_form: () => $("#claude_form")[0],
    },
    OPENAI: {
        name: "OpenAI",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'openai', // Standardize to chat_completion_source
        secret_key: SECRET_KEYS.OPENAI,
        custom_key: "api_key_openai_custom",
        form_id: "openai_form", // Assumed, may need to check HTML
        input_id: "api_key_openai",
        get_form: () => $("#openai_form")[0], // Assumed
    },
    GEMINI: {
        name: "Google AI Studio (Gemini)",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'google', // Standardize to chat_completion_source
        secret_key: SECRET_KEYS.MAKERSUITE,
        custom_key: "api_key_makersuite_custom",
        form_id: "makersuite_form", // Corrected form ID
        input_id: "api_key_makersuite",
        get_form: () => $("#makersuite_form")[0], // Corrected selector
    },
    DEEPSEEK: {
        name: "DeepSeek",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'deepseek', // Need to verify this check
        secret_key: SECRET_KEYS.DEEPSEEK,
        custom_key: "api_key_deepseek_custom",
        form_id: "deepseek_form", // Assumed, may need to check HTML
        input_id: "api_key_deepseek",
        get_form: () => $("#deepseek_form")[0], // Assumed
    },
    XAI: {
        name: "Xai (Grok)",
        source_check: () => oaiFunctions.oai_settings.chat_completion_source === 'xai', // Need to verify this check
        secret_key: SECRET_KEYS.XAI,
        custom_key: "api_key_xai_custom",
        form_id: "xai_form", // Assumed, may need to check HTML
        input_id: "api_key_xai",
        get_form: () => $("#xai_form")[0], // Assumed
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
    }
};

// Removal Triggers
const REMOVAL_STATUS_CODES = [400, 401, 403, 404, 429];
const REMOVAL_MESSAGE_REGEX = /Unauthorized|Forbidden|Permission|Invalid|Exceeded|Internal/i;

// Check if current source matches a provider
const isProviderSource = (provider) => provider.source_check();

// Key switching state - Per provider
let keySwitchingEnabled = {};
let showErrorDetails = {};

// Initialize states from localStorage (Compacted)
Object.keys(PROVIDERS).forEach(providerKey => {
    const provider = PROVIDERS[providerKey];
    keySwitchingEnabled[provider.secret_key] = localStorage.getItem(`switch_key_${provider.secret_key}`) === "true";
    showErrorDetails[provider.secret_key] = localStorage.getItem(`show_${provider.secret_key}_error`) !== "false";
});

// Helper function to update common UI elements for a provider
function updateProviderUI(provider, newKey, apiKeys = [], previousKey = null) {
    const textarea = $(`#${provider.custom_key}`)[0];
    const currentKeyElement = $(`#current_key_${provider.secret_key}`)[0];
    const lastKeyElement = $(`#last_key_${provider.secret_key}`)[0]; // Might be null if called during removal without rotation
    const mainInput = $(`#${provider.input_id}`)[0];
    const displayKey = newKey || 'N/A';
    const keyListString = apiKeys.join("\\n");

    if (textarea) {
        textarea.value = keyListString;
    }
    if (currentKeyElement) {
        currentKeyElement.textContent = `Current: ${displayKey}`;
    }
    // Only update last key if it exists and a previous key was relevant (rotation)
    if (lastKeyElement && previousKey !== null) {
        lastKeyElement.textContent = `Last Rotated: ${previousKey || 'N/A'}`;
    }
    if (mainInput) {
        mainInput.value = newKey || "";
    }
    // Update the global secret state used by SillyTavern UI
    secrets.secret_state[provider.secret_key] = !!newKey;
    secretsFunctions.updateSecretDisplay(); // Refresh placeholders etc.
}

// Show error information popup (Enhanced)
function showErrorPopup(provider, errorMessage, errorTitle = "API Error", wasKeyRemoved = false, removedKey = null) {
    let popupContent = `<h3>${errorTitle}</h3>`;
    let statusCode = null;
    let detailedError = null;

    // Attempt to extract 3-digit status code
    const statusCodeMatch = errorMessage.match(/\b(\d{3})\b/);
    if (statusCodeMatch) {
        statusCode = parseInt(statusCodeMatch[1], 10);
    }

    // Attempt to parse detailed error from JSON in the message
    try {
        // Extract JSON part if possible (simple check for {})
        const jsonMatch = errorMessage.match(/({.*})/);
        if (jsonMatch && jsonMatch[1]) {
            detailedError = JSON.parse(jsonMatch[1]).error; // Assuming error info is under an 'error' key
        }
    } catch (e) {
        // Ignore parsing errors, stick with the raw message
        console.warn("Could not parse detailed error from message:", e);
    }

    const providerMapping = PROVIDER_ERROR_MAPPINGS[provider?.secret_key];

    // Display Provider Name
    if (providerMapping) {
        popupContent += `<h4>Provider: ${providerMapping.name}</h4>`;
    }

    // Display Current Key
    const currentKeyElement = $(`#current_key_${provider?.secret_key}`)[0];
    if (currentKeyElement) {
        // Use textContent which should be like "Current: sk-xxxx..." or "Current: N/A"
        popupContent += `<p><b>${currentKeyElement.textContent}</b></p>`;
    }

    // Display Status Code and Specific Reason
    if (statusCode) {
        popupContent += `<p><b>Status Code:</b> ${statusCode}</p>`;
        if (providerMapping && providerMapping.codes[statusCode]) {
            popupContent += `<p><b>Possible Reason:</b> ${providerMapping.codes[statusCode]}</p>`;
        }
    }

    // Display Parsed Detailed Error Message/Type
    if (detailedError) {
        popupContent += `<p><b>API Message:</b> ${detailedError.message || 'N/A'}</p>`;
        if (detailedError.type) {
            popupContent += `<p><b>Type:</b> ${detailedError.type}</p>`;
        }
        if (detailedError.code) {
            popupContent += `<p><b>Code:</b> ${detailedError.code}</p>`;
        }
    }

    // Display Removal Message if applicable
    if (wasKeyRemoved && removedKey) {
        popupContent += `<p style='color: red; font-weight: bold; margin-top: 10px;'>The failing API key (${removedKey}) has been automatically removed from your list. Please try generating again.</p>`;
    }

    // Separator and Raw Message
    popupContent += `<hr><p><b>Raw Error Message:</b></p>
                     <pre style="white-space: pre-wrap; word-wrap: break-word;">${errorMessage}</pre>`;

    popupFunctions.callGenericPopup(popupContent, popupFunctions.POPUP_TYPE.TEXT, "", { large: true, wide: true, allowVerticalScrolling: true });
}

// Initialize the plugin
async function init(loadedSecrets) {
    if (!loadedSecrets) return;
    
    console.log("MultiProviderKeySwitcher init");
    
    // Fetch available OpenRouter models
    const orModels = document.querySelectorAll("#model_openrouter_select option");
    console.log("OpenRouter models:", orModels);
}

// Create a button element
async function createButton(title, onClick) {
    const button = document.createElement("div");
    button.classList.add("menu_button", "menu_button_icon", "interactable");
    button.title = title;
    button.onclick = onClick;
    
    const span = document.createElement("span");
    span.textContent = title;
    button.appendChild(span);
    
    return button;
}

// Handle key rotation when needed for a specific provider
async function handleKeyRotation(providerKey) {
    const provider = Object.values(PROVIDERS).find(p => p.secret_key === providerKey);
    if (!provider) return;

    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) return;
    if (!keySwitchingEnabled[provider.secret_key]) return;

    // Get the list of API keys
    const apiKeys = (loadedSecrets[provider.custom_key] || "")
        .split(/[\\n;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

    if (apiKeys.length <= 1) return;

    const currentKey = await secretsFunctions.findSecret(provider.secret_key) || "";
    let newKey = "";

    const currentKeyIndex = apiKeys.indexOf(currentKey);
    if (currentKeyIndex !== -1) {
        apiKeys.splice(currentKeyIndex, 1);
        apiKeys.push(currentKey);
        newKey = apiKeys[0];
    } else {
        newKey = apiKeys[0];
    }

    if (!newKey || newKey === currentKey) return;

    await secretsFunctions.writeSecret(provider.secret_key, newKey);
    await saveKey(provider.custom_key, apiKeys.join("\\n"), false);

    // Update UI using the helper function
    updateProviderUI(provider, newKey, apiKeys, currentKey);

    console.log(`${provider.name} Key Rotated: ${currentKey} -> ${newKey}`);
}

// Handle key REMOVAL when specific errors occur
async function handleKeyRemoval(provider, failedKey) {
    console.log(`Attempting to remove failing key for ${provider.name}: ${failedKey}`);
    const loadedSecrets = await getSecrets();
    if (!loadedSecrets || !failedKey) return null;

    let apiKeys = (loadedSecrets[provider.custom_key] || "")
        .split(/[\\n;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

    if (!apiKeys.includes(failedKey)) {
        console.warn(`Key ${failedKey} not found in custom list for ${provider.name}. Cannot remove.`);
        return null;
    }

    apiKeys = apiKeys.filter(key => key !== failedKey);
    console.log(`Removed key ${failedKey}. Remaining keys for ${provider.name}:`, apiKeys);

    await saveKey(provider.custom_key, apiKeys.join("\\n"), false);

    const newKey = apiKeys.length > 0 ? apiKeys[0] : null;
    console.log(`New active key for ${provider.name} will be: ${newKey}`);

    await secretsFunctions.writeSecret(provider.secret_key, newKey || "");

    // Update UI using the helper function
    // Pass null for previousKey as this isn't a rotation display scenario
    updateProviderUI(provider, newKey, apiKeys, null);

    return newKey;
}

// Save a key to secrets
async function saveKey(key, value, updateDisplay = true) {
    await secretsFunctions.writeSecret(key, value);
    if (updateDisplay) {
        secretsFunctions.updateSecretDisplay();
    }
    scriptFunctions.saveSettingsDebounced();
}

// Get secrets from the server
async function getSecrets() {
    const response = await fetch("/api/secrets/view", {
        method: "POST",
        headers: scriptFunctions.getRequestHeaders(),
    });
    
    if (response.status === 403) return;
    if (!response.ok) return;
    
    return await response.json();
}

// jQuery ready function to initialize the plugin
jQuery(async () => {
    console.log("MultiProviderKeySwitcher: jQuery ready, initializing...");

    // Override the default toastr.error to catch API errors
    const originalToastrError = toastr.error;
    toastr.error = async function(...args) { // Make async
        originalToastrError(...args);
        console.log("Toastr Error Args:", args);
        console.error(...args);

        const [errorMessage, errorTitle] = args;

        // Check each provider
        for (const provider of Object.values(PROVIDERS)) {
            // Check if the source is active
            if (isProviderSource(provider)) {
                console.log(`Error occurred while ${provider.name} was active.`);
                let keyRemoved = false;
                let removedKeyValue = null;

                // Fetch the key that likely caused the error
                const failedKey = await secretsFunctions.findSecret(provider.secret_key);
                console.log(`Key that potentially failed for ${provider.name}: ${failedKey}`);

                if (failedKey && keySwitchingEnabled[provider.secret_key]) {
                    // Extract status code
                    const statusCodeMatch = errorMessage.match(/\b(\d{3})\b/);
                    let statusCode = null;
                    if (statusCodeMatch) {
                        statusCode = parseInt(statusCodeMatch[1], 10);
                    }

                    // Check removal conditions ONLY if switching is enabled
                    const isRemovalStatusCode = REMOVAL_STATUS_CODES.includes(statusCode);
                    const isRemovalMessage = REMOVAL_MESSAGE_REGEX.test(errorMessage);

                    if (isRemovalStatusCode || isRemovalMessage) {
                        console.log(`Removal trigger matched for ${provider.name} (Switching ON). Code: ${statusCode}, Message Match: ${isRemovalMessage}. Removing key: ${failedKey}`);
                        const newKey = await handleKeyRemoval(provider, failedKey);
                        keyRemoved = true;
                        removedKeyValue = failedKey;
                        // NOTE: Key rotation (handleKeyRotation) is handled separately by CHAT_COMPLETION_SETTINGS_READY listener
                    } else {
                        console.log(`Error for ${provider.name} (Switching ON) did not match removal triggers.`);
                    }
                } else if (failedKey) {
                    // Log that switching is off, so no removal attempted
                    console.log(`Error for ${provider.name} occurred, but Key Switching is OFF. No key removal attempted.`);
                }

                // Show details popup if enabled (pass removal info)
                if (showErrorDetails[provider.secret_key]) {
                     showErrorPopup(provider, errorMessage, errorTitle || `${provider.name} API Error`, keyRemoved, removedKeyValue);
                }

                 break; // Stop checking other providers once the active one is found
            }
        }
    };

    // Get secrets
    const loadedSecrets = await getSecrets() || {};
    await init(loadedSecrets); // Pass secrets to init if needed (currently doesn't use them)

    // Process each provider
    for (const provider of Object.values(PROVIDERS)) {
        console.log(`Processing provider: ${provider.name}`);
        const formElement = provider.get_form(); // Use the function to get the form
        console.log(`${provider.name} form:`, formElement);

        if (formElement) {
            // Call the helper function to set up the UI
            await setupProviderUI(provider, loadedSecrets, formElement);
        } else {
            console.warn(`Could not find form element for ${provider.name} (ID: ${provider.form_id})`);
        }
    }

    // Model change listener
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHATCOMPLETION_MODEL_CHANGED, async (model) => {
         for (const provider of Object.values(PROVIDERS)) {
            if (isProviderSource(provider)) {
                 console.log(`${provider.name} model changed to: ${model}`);
                 break;
            }
         }
    });

    // Automatic rotation listener
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHAT_COMPLETION_SETTINGS_READY, async () => {
        console.log("Chat completion settings ready, checking for key rotation...");
        const currentSource = oaiFunctions.oai_settings.chat_completion_source;
        console.log(`Current chat_completion_source: ${currentSource}`);

        for (const provider of Object.values(PROVIDERS)) {
             const isActive = isProviderSource(provider);
             console.log(`Checking provider ${provider.name}: isActive = ${isActive}`);

            if (isActive) {
                if (keySwitchingEnabled[provider.secret_key]) {
                    console.log(`Provider ${provider.name} is active and switching is enabled. Attempting key rotation.`);
                    await handleKeyRotation(provider.secret_key);
                }
                 break;
            }
        }
    });

    console.log("MultiProviderKeySwitcher: Initialization complete.");
});

// Export the plugin's init function
export default exports.default; 
