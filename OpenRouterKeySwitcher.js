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

// Show error information popup
function showErrorPopup(customMessage = "") {
    popupFunctions.callGenericPopup(`
        ${customMessage}
        <table class="responsiveTable">
            <thead>
                <tr>
                    <th>Error</th>
                    <th>Reason or Solution</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>401 Unauthorized</td>
                    <td>Your API key is invalid or has expired. Please replace it with a valid key.</td>
                </tr>
                <tr>
                    <td>402 Payment Required</td>
                    <td>Your OpenRouter credits have been depleted. Add funds to your account or use a different API key.</td>
                </tr>
                <tr>
                    <td>429 Too Many Requests</td>
                    <td>You've hit the rate limit. Wait a while before making more requests or switch to a different API key.</td>
                </tr>
                <tr>
                    <td>503 Service Unavailable</td>
                    <td>The model or service is temporarily unavailable. Try again later or select a different model.</td>
                </tr>
                <tr>
                    <td>Model unavailable</td>
                    <td>The selected model may be offline or at capacity. Try a different model or provider.</td>
                </tr>
            </tbody>
        </table>
    `, popupFunctions.POPUP_TYPE.TEXT, "", { large: true, wide: true, allowVerticalScrolling: true });
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
        .split(/[\n;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

    if (apiKeys.length <= 1) return;

    // Get current key from secrets
    // Use findSecret as the main input might be hidden/populated from secrets
    const currentKey = await secretsFunctions.findSecret(provider.secret_key) || ""; // Fetch the currently active key
    let newKey = "";

    // Rotate keys - remove current key from list and add to end
    const currentKeyIndex = apiKeys.indexOf(currentKey);
    if (currentKeyIndex !== -1) {
        apiKeys.splice(currentKeyIndex, 1);
        apiKeys.push(currentKey);
        newKey = apiKeys[0]; // Next key in the list
    } else {
        // If current key isn't in the custom list, just use the first custom key
        newKey = apiKeys[0];
    }

    if (!newKey || newKey === currentKey) return; // No rotation needed or possible

    // Update the active key secret
    await secretsFunctions.writeSecret(provider.secret_key, newKey);
    // Save the rotated list back to the custom key secret
    await saveKey(provider.custom_key, apiKeys.join("\n"), false); // Escaped newline

    // Update UI elements if they exist
    const textarea = $(`#${provider.custom_key}`)[0];
    const currentKeyElement = $(`#current_key_${provider.secret_key}`)[0];
    const lastKeyElement = $(`#last_key_${provider.secret_key}`)[0];

    if (textarea && currentKeyElement && lastKeyElement) {
        currentKeyElement.textContent = `Current: ${newKey}`;
        lastKeyElement.textContent = `Last: ${currentKey || 'N/A'}`; // Show the key that was just replaced
        textarea.value = apiKeys.join("\n"); // Escaped newline
    }

    // Optionally, update the main key input field if it's visible/relevant
    const mainInput = $(`#${provider.input_id}`)[0];
    if (mainInput) {
        mainInput.value = newKey; // Update the main input field
        // Potentially trigger change/input event if needed by other scripts
        // $(mainInput).trigger('input').trigger('change');
    }
     // Update the global secret state used by SillyTavern UI
    secrets.secret_state[provider.secret_key] = !!newKey;
    secretsFunctions.updateSecretDisplay(); // Refresh placeholders etc.

    console.log(`${provider.name} Key Rotated: ${currentKey} -> ${newKey}`);
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
    toastr.error = async function(...args) { // Make async to allow key rotation
        originalToastrError(...args);
        console.log("Toastr Error Args:", args);
        console.error(...args);

        const [errorMessage, errorTitle] = args;

        // Check each provider
        for (const provider of Object.values(PROVIDERS)) {
            // Basic check if the source might match - refine this check if possible
            // Example: Check if errorTitle contains provider name or if source is active
            const isPotentiallyProviderError = (errorTitle === "Chat Completion API" || (errorTitle && errorTitle.includes(provider.name))) // Basic title check
                                               && isProviderSource(provider); // Check if the provider is currently selected

            if (isPotentiallyProviderError && showErrorDetails[provider.secret_key]) {
                 const lastKeyElement = $(`#last_key_${provider.secret_key}`)[0];
                 // TODO: Make error popup content more generic or provider-specific
                showErrorPopup(`<h3>${provider.name} API Error</h3>
                    <p>${errorMessage}</p>
                    <p>${lastKeyElement ? lastKeyElement.textContent : ""}</p>`);

                 // Trigger key rotation on specific errors (e.g., 401, 402, 429)
                 // This requires parsing the errorMessage or having more structured error info
                 const shouldRotate = /401|402|429|invalid api key|insufficient quota/i.test(errorMessage);
                 if (shouldRotate && keySwitchingEnabled[provider.secret_key]) {
                     console.log(`Detected rotation trigger for ${provider.name}. Rotating key...`);
                     await handleKeyRotation(provider.secret_key);
                 }
                 break; // Stop checking other providers once one matches
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
            // Create container for multiple keys
            const flexContainer = document.createElement("div");
            flexContainer.classList.add("flex-container", "flex", "flexFlowColumn"); // Added flexFlowColumn
            flexContainer.style.marginTop = "10px"; // Add some spacing

            // Add heading
            const heading = document.createElement("h4");
            heading.textContent = `${provider.name} Multiple API Keys`;
            heading.style.marginTop = "0px"; // Adjust spacing
            flexContainer.appendChild(heading);

            // Create textarea for API keys
            const textarea = document.createElement("textarea");
            textarea.classList.add("text_pole", "textarea_compact", "autoSetHeight");
            textarea.placeholder = "Enter API Keys (one per line or separated by ';')";
            textarea.style.height = "100px"; // Adjust height as needed
            textarea.id = provider.custom_key;

             // Load existing custom keys
            textarea.value = loadedSecrets[provider.custom_key] || "";

            // Add event listener for saving keys on change
            textarea.addEventListener("change", async () => { // Make async
                const keys = textarea.value
                    .split(/[\n;]/)
                    .map(k => k.trim())
                    .filter(k => k.length > 0);

                textarea.value = keys.join("\n"); // Escaped newline

                // Save the full list to the custom key secret
                await saveKey(provider.custom_key, keys.join("\n"), false); // Escaped newline

                // If keys exist, set the first one as the active key
                if (keys.length > 0) {
                    const firstKey = keys[0];
                    // Check if the current active key is different from the first key in the new list
                    const currentActiveKey = await secretsFunctions.findSecret(provider.secret_key);
                    if (currentActiveKey !== firstKey) {
                         await secretsFunctions.writeSecret(provider.secret_key, firstKey);
                         // Update related UI elements
                         const currentKeyElement = $(`#current_key_${provider.secret_key}`)[0];
                         if (currentKeyElement) currentKeyElement.textContent = `Current: ${firstKey}`;
                         const mainInput = $(`#${provider.input_id}`)[0];
                         if (mainInput) mainInput.value = firstKey;
                         // Update global state and display
                         secrets.secret_state[provider.secret_key] = !!firstKey;
                         secretsFunctions.updateSecretDisplay();
                    }
                } else {
                    // If no keys left, clear the active key
                    await secretsFunctions.writeSecret(provider.secret_key, "");
                    const currentKeyElement = $(`#current_key_${provider.secret_key}`)[0];
                    if (currentKeyElement) currentKeyElement.textContent = `Current: N/A`;
                    const mainInput = $(`#${provider.input_id}`)[0];
                    if (mainInput) mainInput.value = "";
                     // Update global state and display
                    secrets.secret_state[provider.secret_key] = false;
                    secretsFunctions.updateSecretDisplay();
                }
            });


            flexContainer.appendChild(textarea);

            // Create info panel
            const infoPanel = document.createElement("div");
            infoPanel.style.marginTop = "10px";
            const infoPanelHeading = document.createElement("h4");
            infoPanelHeading.textContent = "Key Usage Information:";
            infoPanel.appendChild(infoPanelHeading);

             // Find the currently active key for display
             const activeKey = await secretsFunctions.findSecret(provider.secret_key) || "N/A"; // Fetch active key

            // Current key display
            const currentKeyDiv = document.createElement("div");
            currentKeyDiv.textContent = `Current: ${activeKey}`;
            currentKeyDiv.id = `current_key_${provider.secret_key}`;

            // Last used key display (simplified - shows the last key in the list)
            const lastKeyDiv = document.createElement("div");
            const customKeysArray = (loadedSecrets[provider.custom_key] || "").split("\n"); // Escaped newline
            const lastKey = customKeysArray.length > 1 ? customKeysArray[customKeysArray.length - 1] : "N/A"; // Placeholder logic
            lastKeyDiv.textContent = `Last Rotated: ${lastKey}`; // Adjusted label
            lastKeyDiv.id = `last_key_${provider.secret_key}`;

            // Key switching status
            const switchStatusDiv = document.createElement("div");
            switchStatusDiv.textContent = `Key Switching: ${keySwitchingEnabled[provider.secret_key] ? "On" : "Off"}`;
            switchStatusDiv.id = `switch_key_${provider.secret_key}`;

            // Error toggle status
            const errorToggleDiv = document.createElement("div");
            errorToggleDiv.textContent = `Error Details: ${showErrorDetails[provider.secret_key] ? "On" : "Off"}`;
            errorToggleDiv.id = `show_${provider.secret_key}_error`;

            // Add elements to info panel
            infoPanel.appendChild(currentKeyDiv);
            infoPanel.appendChild(lastKeyDiv);
            infoPanel.appendChild(switchStatusDiv);
            infoPanel.appendChild(errorToggleDiv);

            // Create button container
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("flex-container", "flex");
            buttonContainer.style.marginTop = "10px";

            // Create buttons (using provider context)
            // Note: Removed "Save Keys" button as textarea now saves on change
            // const saveKeysButton = await createButton("Save Keys", async () => { ... }); // Removed

            const keySwitchingButton = await createButton("Toggle Switching", async () => {
                keySwitchingEnabled[provider.secret_key] = !keySwitchingEnabled[provider.secret_key];
                localStorage.setItem(`switch_key_${provider.secret_key}`, keySwitchingEnabled[provider.secret_key].toString());
                switchStatusDiv.textContent = `Key Switching: ${keySwitchingEnabled[provider.secret_key] ? "On" : "Off"}`;
            });

            const viewErrorButton = await createButton("View Error Info", async () => {
                showErrorPopup(); // Keep generic for now
            });

            const errorToggleButton = await createButton("Toggle Error Details", async () => {
                showErrorDetails[provider.secret_key] = !showErrorDetails[provider.secret_key];
                localStorage.setItem(`show_${provider.secret_key}_error`, showErrorDetails[provider.secret_key].toString());
                errorToggleDiv.textContent = `Error Details: ${showErrorDetails[provider.secret_key] ? "On" : "Off"}`;
            });

             const rotateManuallyButton = await createButton("Rotate Key Now", async () => {
                 console.log(`Manual rotation requested for ${provider.name}`);
                 await handleKeyRotation(provider.secret_key);
             });


            // Append buttons to container
            // buttonContainer.appendChild(saveKeysButton); // Removed
            buttonContainer.appendChild(keySwitchingButton);
            buttonContainer.appendChild(rotateManuallyButton); // Added manual rotate
            buttonContainer.appendChild(viewErrorButton);
            buttonContainer.appendChild(errorToggleButton);


             // Inject elements into the form
             // Try inserting before a specific element or appending
             const insertBeforeElement = formElement.querySelector('hr, button, .form_section_block'); // Find a suitable insertion point
             if (insertBeforeElement) {
                 formElement.insertBefore(infoPanel, insertBeforeElement);
                 formElement.insertBefore(flexContainer, insertBeforeElement);
                 formElement.insertBefore(buttonContainer, insertBeforeElement);
                 formElement.insertBefore(document.createElement("hr"), insertBeforeElement); // Add a separator
             } else {
                 // Fallback: Append to the end
                 formElement.appendChild(infoPanel);
                 formElement.appendChild(flexContainer);
                 formElement.appendChild(buttonContainer);
                 formElement.appendChild(document.createElement("hr"));
             }
        } else {
             console.warn(`Could not find form element for ${provider.name} (ID: ${provider.form_id})`);
        }
    }

    // Setup generic event listeners - might need refinement
    // Example: Trigger rotation check when settings are loaded/changed
    // scriptFunctions.eventSource.on(scriptFunctions.event_types.SETTINGS_UPDATED, async () => {
    //     console.log("Settings updated, potentially re-evaluating key rotation needs.");
        // Check active provider and potentially call handleKeyRotation if conditions met
    // });

    // Add listeners specific to API changes if possible
    // scriptFunctions.eventSource.on(scriptFunctions.event_types.API_CHANGED, async (apiType) => {
    //     const provider = Object.values(PROVIDERS).find(p => p.some_identifier === apiType);
    //     if (provider) {
    //         await handleKeyRotation(provider.secret_key); // Example trigger
    //     }
    // });

    // Model change listener - adapt if necessary for non-OpenRouter providers
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHATCOMPLETION_MODEL_CHANGED, async (model) => {
         for (const provider of Object.values(PROVIDERS)) {
            if (isProviderSource(provider)) {
                 // Potentially save model or perform actions specific to this provider
                 console.log(`${provider.name} model changed to: ${model}`);
                 // Example: await saveKey(`${provider.secret_key}_model`, model);
                 break;
            }
         }
    });

    // Add listener for automatic key rotation before chat completion requests
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHAT_COMPLETION_SETTINGS_READY, async () => {
        console.log("Chat completion settings ready, checking for key rotation...");
        // Log current source setting
        const currentSource = oaiFunctions.oai_settings.chat_completion_source;
        console.log(`Current chat_completion_source: ${currentSource}`);

        for (const provider of Object.values(PROVIDERS)) {
             const isActive = isProviderSource(provider);
             // Log check result for each provider
             console.log(`Checking provider ${provider.name}: isActive = ${isActive}`);

            if (isActive) {
                // Check if key switching is enabled for this provider before rotating
                if (keySwitchingEnabled[provider.secret_key]) {
                    console.log(`Provider ${provider.name} is active and switching is enabled. Attempting key rotation.`);
                    await handleKeyRotation(provider.secret_key);
                }
                 break; // Process only the active provider
            }
        }
    });

    console.log("MultiProviderKeySwitcher: Initialization complete.");
});

// Export the plugin's init function
export default exports.default; 
