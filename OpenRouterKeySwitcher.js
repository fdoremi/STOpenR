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

// Handle key rotation when needed
async function handleKeyRotation() {
    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) return;
    if (!keySwitchingEnabled) return;
    
    // Get the list of API keys
    const apiKeys = (loadedSecrets[CUSTOM_KEYS_KEY] || "")
        .split(/[\n;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
    
    if (apiKeys.length <= 1) return;
    
    // Get current key
    const currentKey = loadedSecrets.api_key_openrouter;
    let newKey = "";
    
    // Rotate keys - remove current key from list and add to end
    if (apiKeys.includes(currentKey)) {
        apiKeys.splice(apiKeys.indexOf(currentKey), 1);
        apiKeys.push(currentKey);
    }
    
    // Get first key from rotated list
    newKey = apiKeys[0];
    
    // Update the key
    secretsFunctions.writeSecret("api_key_openrouter", newKey);
    saveKey(CUSTOM_KEYS_KEY, apiKeys.join("\n"));
    
    // Update UI
    const textarea = $("#api_key_openrouter_custom")[0];
    const currentKeyElement = $("#current_key_openrouter")[0];
    const lastKeyElement = $("#last_key_openrouter")[0];
    
    console.log("Textarea:", textarea);
    console.log("API keys:", apiKeys);
    
    // Update UI elements if they exist
    if (textarea) {
        currentKeyElement.textContent = `Current Key: ${newKey}`;
        lastKeyElement.textContent = `Last Key: ${currentKey}`;
        textarea.value = apiKeys.join("\n");
    }
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
    
    // Override the default toastr.error to catch OpenRouter errors
    const originalToastrError = toastr.error;
    toastr.error = function(...args) {
        originalToastrError(...args);
        console.log(args);
        console.error(...args);
        
        if (!isOpenRouterSource() || !showErrorDetails) return;
        
        const [errorMessage, errorTitle] = args;
        if (errorTitle && errorTitle === "Chat Completion API") {
            const lastKeyElement = $("#last_key_openrouter")[0];
            showErrorPopup(`<h3>Chat Completion API Error</h3>
                <p>${errorMessage}</p>
                <p>${lastKeyElement ? lastKeyElement.textContent : ""}</p>`);
        }
    };
    
    // Get secrets
    const secrets = await getSecrets() || {};
    await init(secrets);
    
    // Get the form - don't return early if not found
    const openrouterForm = $("#openrouter_form")[0];
    console.log("OpenRouterKeySwitcher: Found form:", openrouterForm);
    
    if (openrouterForm) {
        // Create container for multiple keys
        const flexContainer = document.createElement("div");
        flexContainer.classList.add("flex-container", "flex");
        
        // Add heading
        const heading = document.createElement("h4");
        heading.textContent = "OpenRouter Multiple API Keys";
        flexContainer.appendChild(heading);
        
        // Create textarea for API keys
        const textarea = document.createElement("textarea");
        textarea.classList.add("text_pole", "textarea_compact", "autoSetHeight");
        textarea.placeholder = "API Keys";
        textarea.style.height = "100px";
        textarea.id = "api_key_openrouter_custom";
        
        // Add event listener for changes
        textarea.addEventListener("change", () => {
            const keys = textarea.value
                .split(/[\n;]/)
                .map(k => k.trim())
                .filter(k => k.length > 0);
            
            textarea.value = keys.join("\n");
            
            if (keys.length === 0) {
                return void saveKey(CUSTOM_KEYS_KEY, keys.join("\n"));
            }
            
            const firstKey = keys[0];
            secretsFunctions.writeSecret("api_key_openrouter", firstKey);
            saveKey(CUSTOM_KEYS_KEY, keys.join("\n"));
        });
        
        // Set initial value
        textarea.value = secrets[CUSTOM_KEYS_KEY] || "";
        flexContainer.appendChild(textarea);
        
        // Create info panel
        const infoPanel = document.createElement("div");
        const infoPanelHeading = document.createElement("h4");
        infoPanelHeading.textContent = "Key Usage Information:";
        infoPanel.appendChild(infoPanelHeading);
        
        // Current key display
        const currentKeyDiv = document.createElement("div");
        currentKeyDiv.textContent = `Current: ${secrets.api_key_openrouter || ""}`;
        currentKeyDiv.id = "current_key_openrouter";
        
        // Last used key display
        const lastKeyDiv = document.createElement("div");
        const lastKey = secrets[CUSTOM_KEYS_KEY]?.split("\n").pop() || "";
        lastKeyDiv.textContent = `Last: ${lastKey}`;
        lastKeyDiv.id = "last_key_openrouter";
        
        // Key switching status
        const switchStatusDiv = document.createElement("div");
        switchStatusDiv.textContent = `Key Switching: ${keySwitchingEnabled ? "On" : "Off"}`;
        switchStatusDiv.id = "switch_key_openrouter";
        
        // Error toggle status
        const errorToggleDiv = document.createElement("div");
        errorToggleDiv.textContent = `Error Details: ${showErrorDetails ? "On" : "Off"}`;
        errorToggleDiv.id = "show_openrouter_error";
        
        // Add elements to info panel
        infoPanel.appendChild(currentKeyDiv);
        infoPanel.appendChild(lastKeyDiv);
        infoPanel.appendChild(switchStatusDiv);
        infoPanel.appendChild(errorToggleDiv);
        
        // Add panels to form
        openrouterForm.appendChild(infoPanel);
        openrouterForm.appendChild(flexContainer);
        
        // Create buttons
        const saveKeysButton = await createButton("Save Keys", async () => {
            const keys = textarea.value
                .split(/[\n;]/)
                .map(k => k.trim())
                .filter(k => k.length > 0);
            
            textarea.value = keys.join("\n");
            
            if (keys.length === 0) {
                return void saveKey(CUSTOM_KEYS_KEY, keys.join("\n"));
            }
            
            const firstKey = keys[0];
            secretsFunctions.writeSecret("api_key_openrouter", firstKey);
            saveKey(CUSTOM_KEYS_KEY, keys.join("\n"));
        });
        
        const keySwitchingButton = await createButton("Key Switching Settings", async () => {
            keySwitchingEnabled = !keySwitchingEnabled;
            localStorage.setItem("switch_key_openrouter", keySwitchingEnabled.toString());
            switchStatusDiv.textContent = `Key Switching: ${keySwitchingEnabled ? "On" : "Off"}`;
        });
        
        const viewErrorButton = await createButton("View Error Info", async () => {
            showErrorPopup();
        });
        
        const errorToggleButton = await createButton("Error Details Toggle", async () => {
            showErrorDetails = !showErrorDetails;
            localStorage.setItem("show_openrouter_error", showErrorDetails.toString());
            errorToggleDiv.textContent = `Error Details: ${showErrorDetails ? "On" : "Off"}`;
        });
        
        // Create button container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("flex-container", "flex");
        buttonContainer.appendChild(saveKeysButton);
        buttonContainer.appendChild(keySwitchingButton);
        buttonContainer.appendChild(viewErrorButton);
        buttonContainer.appendChild(errorToggleButton);
        
        // Add button container to form
        openrouterForm.appendChild(buttonContainer);
        openrouterForm.appendChild(document.createElement("hr"));
    }
    
    // Setup event listeners
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHAT_COMPLETION_SETTINGS_READY, handleKeyRotation);
    scriptFunctions.eventSource.on(scriptFunctions.event_types.CHATCOMPLETION_MODEL_CHANGED, async (model) => {
        if (isOpenRouterSource()) {
            await saveKey("api_key_openrouter_model", model);
        }
    });
});

// Export the plugin's init function
export default exports.default; 