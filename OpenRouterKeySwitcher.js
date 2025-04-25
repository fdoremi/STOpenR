import * as script from "../../../../../script.js";
import * as secrets from "../../../../../scripts/secrets.js";
import * as oai from "../../../../../scripts/openai.js";
import * as popup from "../../../../../scripts/popup.js";

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
    writeSecret: secrets.writeSecret
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

// OpenRouter sources
const OPENROUTER_SOURCES = ["openrouter"];

// Check if current source is OpenRouter
const isOpenRouterSource = () => OPENROUTER_SOURCES.includes(oaiFunctions.oai_settings.chat_completion_source);

// Key switching state
let keySwitchingEnabled = localStorage.getItem("switch_key_openrouter") === "true";
let showErrorDetails = localStorage.getItem("show_openrouter_error") !== "false";

// Custom key storage
const CUSTOM_KEYS_KEY = "api_key_openrouter_custom";

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
    
    console.log("OpenRouterKeySwitcher init");
    
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

// Function to update the current key display
async function updateCurrentKeyDisplay() {
    const currentKeyElement = $("#current_key_openrouter")[0];
    if (!currentKeyElement) {
        console.warn("OpenRouterKeySwitcher: Could not find current key display element.");
        return; 
    }

    currentKeyElement.textContent = "Current Key: Loading..."; // Show loading state

    try {
        const latestSecrets = await getSecrets();
        if (latestSecrets && latestSecrets.api_key_openrouter) {
            const currentKey = latestSecrets.api_key_openrouter;
            // Mask the key for display (e.g., show first 4 and last 4 chars)
            const maskedKey = currentKey.length > 8 ? `${currentKey.substring(0, 4)}...${currentKey.substring(currentKey.length - 4)}` : currentKey;
            currentKeyElement.textContent = `Current Key: ${maskedKey}`;
        } else {
            currentKeyElement.textContent = "Current Key: Not Set";
        }
    } catch (err) {
        console.error("OpenRouterKeySwitcher: Failed to fetch secrets to update key display:", err);
        currentKeyElement.textContent = "Current Key: Error";
    }
}

// Handle key rotation when needed
async function handleKeyRotation() {
    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) {
        console.error("OpenRouterKeySwitcher: Failed to load secrets for rotation.");
        toastr.error("Failed to load secrets for key rotation.");
        return;
    }
    if (!keySwitchingEnabled) {
        console.log("OpenRouterKeySwitcher: Key switching disabled, skipping rotation.");
        // Optional: Notify user if they trigger manual rotation while disabled
        // toastr.info("Key switching is currently disabled in settings.");
        return;
    }

    // Get the list of API keys
    const apiKeys = (loadedSecrets[CUSTOM_KEYS_KEY] || "")
        .split(/[\n;]/) // Split by newline or semicolon
        .map(k => k.trim())
        .filter(k => k.length > 0);

    if (apiKeys.length <= 1) {
        console.log("OpenRouterKeySwitcher: Not enough keys to rotate.");
         toastr.info("OpenRouter Key Switcher: Add more keys to enable rotation.");
        return;
    }

    // Get current key
    const currentKey = loadedSecrets.api_key_openrouter || "";
    let newKey = "";
    let rotatedKeys = [...apiKeys]; // Create a mutable copy
    let previousKey = currentKey; // Store the key being replaced

    const currentIndex = rotatedKeys.indexOf(currentKey);

    if (currentIndex !== -1) {
        // Move the current key to the end
        console.log(`OpenRouterKeySwitcher: Found current key '${currentKey.substring(0,4)}...' at index ${currentIndex}. Moving to end.`);
        rotatedKeys.splice(currentIndex, 1);
        rotatedKeys.push(currentKey);
    } else if (rotatedKeys.length > 0) {
         // If current key wasn't in the list (maybe set manually?), just pick the first from the custom list.
         console.log(`OpenRouterKeySwitcher: Current key '${currentKey.substring(0,4)}...' not in custom list. Will use first key from list.`);
         // Keep track of the key that *was* active, even if not in the list
         previousKey = currentKey || "Unknown";
    } else {
         // This case should technically be caught by apiKeys.length <= 1, but adding for safety.
         console.warn("OpenRouterKeySwitcher: No keys available in the custom list to rotate to.");
         return; // No keys to switch to
    }


    // Get the *new* first key from the potentially rotated list
    newKey = rotatedKeys[0];
    
    if (newKey === currentKey) {
        console.log("OpenRouterKeySwitcher: Rotation resulted in the same key. No change needed.");
        // This might happen if the current key wasn't found and the first key in the list was the same.
        // Or if there are only duplicate keys in the list.
        return;
    }

    console.log(`OpenRouterKeySwitcher: Attempting rotation. Previous: ${previousKey.substring(0,4)}..., New: ${newKey.substring(0,4)}...`);

    try {
        // Update the main OpenRouter key
        await secretsFunctions.writeSecret("api_key_openrouter", newKey);
        // Save the reordered list back to the custom keys secret (important to keep order consistent)
        await saveKey(CUSTOM_KEYS_KEY, rotatedKeys.join("\n"), false); // false = don't trigger generic updateSecretDisplay

        console.log(`OpenRouterKeySwitcher: Successfully rotated key.`);
        localStorage.setItem("last_rotated_key_openrouter", previousKey); // Store the key that was just replaced

        // Update the "Previous Key" UI element directly, as updateCurrentKeyDisplay only handles the current one.
        const lastKeyElement = $("#last_key_openrouter")[0];
         if (lastKeyElement) {
             const maskedLastKey = previousKey.length > 8 ? `${previousKey.substring(0, 4)}...${previousKey.substring(previousKey.length - 4)}` : previousKey;
             lastKeyElement.textContent = `Previous Key: ${maskedLastKey}`;
         }

         // Update the textarea displaying the list of keys
         const textarea = $("#api_key_openrouter_custom")[0];
         if (textarea) {
             textarea.value = rotatedKeys.join("\n");
         }
         
         // Important: Save settings AFTER secrets have been successfully written
         scriptFunctions.saveSettingsDebounced();
         
         // Notify user of successful rotation (optional, can be noisy)
         // toastr.success(`Rotated OpenRouter key. New key ends in ...${newKey.substring(newKey.length - 4)}`);

    } catch (error) {
        console.error("OpenRouterKeySwitcher: Error during key rotation:", error);
        toastr.error("Failed to save rotated key. Check console for details.");
    }
    // Note: updateCurrentKeyDisplay should be called *after* this function completes successfully.
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
    console.log("OpenRouterKeySwitcher: jQuery ready, initializing...");
    
    // Define updateCurrentKeyDisplay locally within jQuery ready scope 
    // if it wasn't defined globally earlier or needs access to local vars.
    // (Assuming it's defined globally as per previous step)

    // Override the default toastr.error to catch OpenRouter errors
    const originalToastrError = toastr.error;
    toastr.error = function(...args) {
        originalToastrError(...args); // Call original first
        console.log("OpenRouterKeySwitcher: toastr.error called with:", args);
        console.error(...args); // Log the error for debugging

        // Only proceed if OpenRouter is the selected source
        if (!isOpenRouterSource()) {
             console.log("OpenRouterKeySwitcher: Not an OpenRouter source, ignoring error for rotation.");
            return;
        }

        const [errorMessage, errorTitle] = args;

        // Check if conditions are met for automatic key rotation
        const shouldAttemptRotation = 
            keySwitchingEnabled && 
            errorTitle === "Chat Completion API" &&
            errorMessage && // Ensure errorMessage is defined
            (errorMessage.includes("401") || // Unauthorized (invalid/expired key)
             errorMessage.includes("402") || // Payment Required (out of credits)
             errorMessage.includes("429"));   // Too Many Requests (rate limit potentially per-key)

        if (shouldAttemptRotation) {
            console.log("OpenRouterKeySwitcher: Detected API error suggesting key issue. Attempting automatic rotation.");
            // Use .then() to ensure UI update happens after rotation attempt
            handleKeyRotation().then(() => {
                console.log("OpenRouterKeySwitcher: Automatic rotation function completed. Updating display.");
                // Rotation successful (or decided no rotation needed), update the display
                toastr.info("Attempted to rotate OpenRouter API key due to error.");
                updateCurrentKeyDisplay(); // Re-fetch and display the (potentially new) current key
            }).catch(err => {
                // Catch errors specifically from handleKeyRotation itself
                console.error("OpenRouterKeySwitcher: Error during automatic key rotation execution:", err);
                toastr.warning("Failed to automatically rotate OpenRouter API key. See console.");
            });
        } else {
             console.log("OpenRouterKeySwitcher: Error did not meet criteria for automatic rotation.", 
                         { keySwitchingEnabled, errorTitle, isAPIError: errorTitle === "Chat Completion API", includesCode: errorMessage?.search(/401|402|429/) !== -1 });
        }

        // Show the enhanced error details popup if enabled
        if (showErrorDetails && errorTitle === "Chat Completion API") {
            const lastKeyElement = $("#last_key_openrouter")[0]; 
            const currentKeyElement = $("#current_key_openrouter")[0]; 
            // Use textContent from the elements if they exist, otherwise show N/A
            const currentKeyText = currentKeyElement ? currentKeyElement.textContent : "Current Key: N/A";
            const lastKeyText = lastKeyElement ? lastKeyElement.textContent : "Previous Key: N/A";
            
            showErrorPopup(`<h3>Chat Completion API Error</h3>
                <p><b>Message:</b> ${errorMessage || "No details provided."}</p>
                <p>--- Key Info ---</p>
                <p>${currentKeyText}</p>
                <p>${lastKeyText}</p>`);
        }
    };
    
    // Fetch initial secrets to setup the UI state
    const secrets = await getSecrets() || {};
    // Initialize any other parts of the plugin if needed
    await init(secrets); 
    
    // Find the OpenRouter settings form
    const openrouterForm = $("#openai_settings_form"); // Corrected ID likely includes openai
    if (!openrouterForm.length) {
         console.warn("OpenRouterKeySwitcher: Could not find #openai_settings_form element. UI will not be added.");
        return; // Exit if the form isn't found
    }
    
    // --- Create and Inject UI Elements --- 
    console.log("OpenRouterKeySwitcher: Found form, adding UI elements...");
    
    // Create container for our extension's settings
    const extensionContainer = document.createElement("div");
    extensionContainer.id = "openrouter-key-switcher-settings";
    extensionContainer.style.border = "1px solid #ccc";
    extensionContainer.style.padding = "10px";
    extensionContainer.style.marginTop = "15px";
    extensionContainer.style.marginBottom = "15px";

    const heading = document.createElement("h4");
    heading.textContent = "OpenRouter Key Switcher";
    extensionContainer.appendChild(heading);

    // Textarea for multiple API keys
    const keyListLabel = document.createElement("label");
    keyListLabel.textContent = "OpenRouter Keys (one per line or separated by ;):";
    keyListLabel.style.display = "block";
    keyListLabel.style.marginBottom = "5px";
    extensionContainer.appendChild(keyListLabel);

    const textarea = document.createElement("textarea");
    textarea.classList.add("text_pole", "textarea_compact"); // Removed autoSetHeight if not needed
    textarea.placeholder = "sk-or-v1-...\nsk-or-v1-...";
    textarea.style.height = "80px"; // Adjusted height
    textarea.style.width = "100%";
    textarea.style.marginBottom = "10px";
    textarea.id = "api_key_openrouter_custom";
    textarea.value = secrets[CUSTOM_KEYS_KEY] || ""; // Load saved keys
    extensionContainer.appendChild(textarea);

    // Save Keys Button (associated with textarea changes)
    const saveKeysButton = document.createElement("button");
    saveKeysButton.textContent = "Save Key List";
    saveKeysButton.classList.add("menu_button");
    saveKeysButton.style.marginBottom = "10px";
    saveKeysButton.onclick = async () => {
        const keys = textarea.value
            .split(/[\n;]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
        
        textarea.value = keys.join("\n"); // Normalize display
        await saveKey(CUSTOM_KEYS_KEY, keys.join("\n"), false); // Save the list
        // Maybe set the first key as active if the list was previously empty?
        // const currentSecrets = await getSecrets();
        // if (!currentSecrets.api_key_openrouter && keys.length > 0) {
        //    await secretsFunctions.writeSecret("api_key_openrouter", keys[0]);
        //    await scriptFunctions.saveSettingsDebounced();
        //    await updateCurrentKeyDisplay();
        // }
        toastr.success("OpenRouter key list saved.");
    };
    extensionContainer.appendChild(saveKeysButton);

    // Key Status Display Area
    const statusArea = document.createElement("div");
    statusArea.style.marginTop = "10px";
    statusArea.style.marginBottom = "10px";

    const currentKeyDisplay = document.createElement("div");
    currentKeyDisplay.id = "current_key_openrouter";
    currentKeyDisplay.style.fontSize = "0.9em";
    currentKeyDisplay.textContent = "Current Key: Loading...";
    statusArea.appendChild(currentKeyDisplay);

    const lastKeyDisplay = document.createElement("div");
    lastKeyDisplay.id = "last_key_openrouter";
    lastKeyDisplay.style.fontSize = "0.9em";
    const lastKey = localStorage.getItem("last_rotated_key_openrouter") || "N/A";
    const maskedLastKey = lastKey.length > 8 ? `${lastKey.substring(0, 4)}...${lastKey.substring(lastKey.length - 4)}` : lastKey;
    lastKeyDisplay.textContent = `Previous Key: ${maskedLastKey}`;
    statusArea.appendChild(lastKeyDisplay);
    extensionContainer.appendChild(statusArea);

    // Manual Rotate Button
    const rotateButton = document.createElement("button");
    rotateButton.textContent = "Manually Rotate Key";
    rotateButton.classList.add("menu_button");
    rotateButton.style.marginRight = "10px";
    rotateButton.onclick = async () => {
        console.log("OpenRouterKeySwitcher: Manual rotation triggered.");
        await handleKeyRotation(); // Attempt rotation
        await updateCurrentKeyDisplay(); // Update display regardless of outcome
    };
    extensionContainer.appendChild(rotateButton);

    // Toggle: Enable/Disable Automatic Key Switching
    const keySwitchToggleLabel = document.createElement("label");
    keySwitchToggleLabel.style.marginLeft = "15px"; 
    keySwitchToggleLabel.style.cursor = "pointer";
    const keySwitchToggleCheckbox = document.createElement("input");
    keySwitchToggleCheckbox.type = "checkbox";
    keySwitchToggleCheckbox.checked = keySwitchingEnabled;
    keySwitchToggleCheckbox.id = "toggle_auto_key_switch";
    keySwitchToggleCheckbox.onchange = () => {
        keySwitchingEnabled = keySwitchToggleCheckbox.checked;
        localStorage.setItem("switch_key_openrouter", keySwitchingEnabled.toString());
        console.log(`OpenRouterKeySwitcher: Automatic key switching ${keySwitchingEnabled ? 'enabled' : 'disabled'}`);
        toastr.info(`Automatic key switching ${keySwitchingEnabled ? 'enabled' : 'disabled'}`);
    };
    keySwitchToggleLabel.appendChild(keySwitchToggleCheckbox);
    keySwitchToggleLabel.appendChild(document.createTextNode(" Auto-Rotate on Error"));
    extensionContainer.appendChild(keySwitchToggleLabel);

    // Toggle: Show/Hide Error Details Popup
    const errorDetailsToggleLabel = document.createElement("label");
    errorDetailsToggleLabel.style.marginLeft = "15px"; 
    errorDetailsToggleLabel.style.cursor = "pointer";
    const errorDetailsToggleCheckbox = document.createElement("input");
    errorDetailsToggleCheckbox.type = "checkbox";
    errorDetailsToggleCheckbox.checked = showErrorDetails;
    errorDetailsToggleCheckbox.id = "toggle_error_details_popup";
    errorDetailsToggleCheckbox.onchange = () => {
        showErrorDetails = errorDetailsToggleCheckbox.checked;
        localStorage.setItem("show_openrouter_error", showErrorDetails.toString());
        console.log(`OpenRouterKeySwitcher: Show error details popup ${showErrorDetails ? 'enabled' : 'disabled'}`);
        toastr.info(`Error details popup ${showErrorDetails ? 'enabled' : 'disabled'}`);
    };
    errorDetailsToggleLabel.appendChild(errorDetailsToggleCheckbox);
    errorDetailsToggleLabel.appendChild(document.createTextNode(" Show Error Popup"));
    extensionContainer.appendChild(errorDetailsToggleLabel);
    
    // Inject the container into the form
    // Try to insert it after the main API key input for better context
    const apiKeyInput = $("#api_key_openai"); // Standard OpenAI key input ID
    if (apiKeyInput.length) {
        apiKeyInput.closest(".form-group").after(extensionContainer);
    } else {
        // Fallback: append to the end of the form
        openrouterForm.append(extensionContainer);
    }

    // Initial update for the current key display
    await updateCurrentKeyDisplay(); 
    console.log("OpenRouterKeySwitcher: UI injection and initial setup complete.");

    // Remove potentially problematic old event listeners if they existed
    // scriptFunctions.eventSource.off(scriptFunctions.event_types.CHAT_COMPLETION_SETTINGS_READY, handleKeyRotation);
    // scriptFunctions.eventSource.off(scriptFunctions.event_types.CHATCOMPLETION_MODEL_CHANGED);

}); // End jQuery ready


// Export the plugin's init function
export default init; 
