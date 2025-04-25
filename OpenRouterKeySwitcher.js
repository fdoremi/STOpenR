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
    writeSecret: secrets.writeSecret,
    SECRET_KEYS: secrets.SECRET_KEYS
};

// Import settings from openai.js
const oaiFunctions = {
    oai_settings: oai.oai_settings,
    chat_completion_sources: oai.chat_completion_sources
};

// Import popup functions
const popupFunctions = {
    POPUP_TYPE: popup.POPUP_TYPE,
    callGenericPopup: popup.callGenericPopup
};

// Define key switching sources
const KEY_SWITCHING_SOURCES = {
    OPENROUTER: 'openrouter',
    CLAUDE: 'claude',
    OPENAI: 'openai',
    DEEPSEEK: 'deepseek',
    XAI: 'xai',
    MAKERSUITE: 'makersuite'
};

// Custom keys storage constants
const CUSTOM_KEYS = {
    OPENROUTER: "api_key_openrouter_custom",
    CLAUDE: "api_key_claude_custom",
    OPENAI: "api_key_openai_custom",
    DEEPSEEK: "api_key_deepseek_custom",
    XAI: "api_key_xai_custom",
    MAKERSUITE: "api_key_makersuite_custom"
};

// Check if current source matches one of our key-switching sources
const isKeySwitchingSource = (source) => {
    return Object.values(KEY_SWITCHING_SOURCES).includes(source);
};

// Key switching state for each provider
let keySwitchingEnabled = {
    [KEY_SWITCHING_SOURCES.OPENROUTER]: localStorage.getItem("switch_key_openrouter") === "true",
    [KEY_SWITCHING_SOURCES.CLAUDE]: localStorage.getItem("switch_key_claude") === "true",
    [KEY_SWITCHING_SOURCES.OPENAI]: localStorage.getItem("switch_key_openai") === "true",
    [KEY_SWITCHING_SOURCES.DEEPSEEK]: localStorage.getItem("switch_key_deepseek") === "true",
    [KEY_SWITCHING_SOURCES.XAI]: localStorage.getItem("switch_key_xai") === "true",
    [KEY_SWITCHING_SOURCES.MAKERSUITE]: localStorage.getItem("switch_key_makersuite") === "true"
};

// Track if error details should be shown for each provider
let showErrorDetails = {
    [KEY_SWITCHING_SOURCES.OPENROUTER]: localStorage.getItem("show_openrouter_error") !== "false",
    [KEY_SWITCHING_SOURCES.CLAUDE]: localStorage.getItem("show_claude_error") !== "false",
    [KEY_SWITCHING_SOURCES.OPENAI]: localStorage.getItem("show_openai_error") !== "false",
    [KEY_SWITCHING_SOURCES.DEEPSEEK]: localStorage.getItem("show_deepseek_error") !== "false",
    [KEY_SWITCHING_SOURCES.XAI]: localStorage.getItem("show_xai_error") !== "false",
    [KEY_SWITCHING_SOURCES.MAKERSUITE]: localStorage.getItem("show_makersuite_error") !== "false"
};

// Map source types to their secret keys
const SOURCE_TO_SECRET_KEY = {
    [KEY_SWITCHING_SOURCES.OPENROUTER]: secretsFunctions.SECRET_KEYS.OPENROUTER,
    [KEY_SWITCHING_SOURCES.CLAUDE]: secretsFunctions.SECRET_KEYS.CLAUDE,
    [KEY_SWITCHING_SOURCES.OPENAI]: secretsFunctions.SECRET_KEYS.OPENAI,
    [KEY_SWITCHING_SOURCES.DEEPSEEK]: secretsFunctions.SECRET_KEYS.DEEPSEEK,
    [KEY_SWITCHING_SOURCES.XAI]: secretsFunctions.SECRET_KEYS.XAI,
    [KEY_SWITCHING_SOURCES.MAKERSUITE]: secretsFunctions.SECRET_KEYS.MAKERSUITE
};

// Map source types to their chat completion sources
const SOURCE_TO_CHAT_COMPLETION = {
    [KEY_SWITCHING_SOURCES.OPENROUTER]: oaiFunctions.chat_completion_sources.OPENROUTER,
    [KEY_SWITCHING_SOURCES.CLAUDE]: oaiFunctions.chat_completion_sources.CLAUDE,
    [KEY_SWITCHING_SOURCES.OPENAI]: oaiFunctions.chat_completion_sources.OPENAI,
    [KEY_SWITCHING_SOURCES.DEEPSEEK]: oaiFunctions.chat_completion_sources.DEEPSEEK,
    [KEY_SWITCHING_SOURCES.XAI]: oaiFunctions.chat_completion_sources.XAI,
    [KEY_SWITCHING_SOURCES.MAKERSUITE]: oaiFunctions.chat_completion_sources.MAKERSUITE
};

// Map sources to their form selectors
const SOURCE_TO_FORM = {
    [KEY_SWITCHING_SOURCES.OPENROUTER]: "#openrouter_form",
    [KEY_SWITCHING_SOURCES.CLAUDE]: "#claude_form",
    [KEY_SWITCHING_SOURCES.OPENAI]: "#openai_form",
    [KEY_SWITCHING_SOURCES.DEEPSEEK]: "#deepseek_form",
    [KEY_SWITCHING_SOURCES.XAI]: "#xai_form",
    [KEY_SWITCHING_SOURCES.MAKERSUITE]: "#makersuite_form"
};

// Show error information popup
function showErrorPopup(customMessage = "", source = KEY_SWITCHING_SOURCES.OPENROUTER) {
    // Create a title based on the source
    const sourceTitle = source.charAt(0).toUpperCase() + source.slice(1);
    
    popupFunctions.callGenericPopup(`
        <h3>${sourceTitle} API Error Information</h3>
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
                    <td>Your credits have been depleted. Add funds to your account or use a different API key.</td>
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
    
    console.log("API KeySwitcher init");
    
    // Fetch available models
    console.log("Checking for API forms...");
    
    // Initialize for all supported providers
    for (const source of Object.values(KEY_SWITCHING_SOURCES)) {
        console.log(`Checking for ${source} form...`);
        const formElement = $(SOURCE_TO_FORM[source])[0];
        if (formElement) {
            console.log(`Found ${source} form`);
        }
    }
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
async function handleKeyRotation(source = KEY_SWITCHING_SOURCES.OPENROUTER) {
    const loadedSecrets = await getSecrets();
    if (!loadedSecrets) return;
    if (!keySwitchingEnabled[source]) return;
    
    // Get the custom keys storage key for this source
    const customKeysKey = CUSTOM_KEYS[source];
    
    // Get the list of API keys
    const apiKeys = (loadedSecrets[customKeysKey] || "")
        .split(/[\n;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
    
    if (apiKeys.length <= 1) return;
    
    // Get current key and secret key name
    const secretKey = SOURCE_TO_SECRET_KEY[source];
    const currentKey = loadedSecrets[secretKey];
    let newKey = "";
    
    // Rotate keys - remove current key from list and add to end
    if (apiKeys.includes(currentKey)) {
        apiKeys.splice(apiKeys.indexOf(currentKey), 1);
        apiKeys.push(currentKey);
    }
    
    // Get first key from rotated list
    newKey = apiKeys[0];
    
    // Update the key
    secretsFunctions.writeSecret(secretKey, newKey);
    saveKey(customKeysKey, apiKeys.join("\n"));
    
    // Update UI if elements exist
    const textarea = $(`#${customKeysKey}`)[0];
    const currentKeyElement = $(`#current_key_${source}`)[0];
    const lastKeyElement = $(`#last_key_${source}`)[0];
    
    console.log(`Rotating key for ${source}`);
    
    // Update UI elements if they exist
    if (textarea) {
        textarea.value = apiKeys.join("\n");
    }
    
    if (currentKeyElement) {
        currentKeyElement.textContent = `Current Key: ${newKey}`;
    }
    
    if (lastKeyElement) {
        lastKeyElement.textContent = `Last Key: ${currentKey}`;
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

// Create UI for a given source
async function createSourceUI(source, form) {
    if (!form) return;
    
    // Get the custom keys storage key for this source
    const customKeysKey = CUSTOM_KEYS[source];
    const secrets = await getSecrets() || {};
    
    // Create container for multiple keys
    const flexContainer = document.createElement("div");
    flexContainer.classList.add("flex-container", "flex");
    
    // Add heading
    const heading = document.createElement("h4");
    heading.textContent = `${source.charAt(0).toUpperCase() + source.slice(1)} Multiple API Keys`;
    flexContainer.appendChild(heading);
    
    // Create textarea for API keys
    const textarea = document.createElement("textarea");
    textarea.classList.add("text_pole", "textarea_compact", "autoSetHeight");
    textarea.placeholder = "API Keys";
    textarea.style.height = "100px";
    textarea.id = customKeysKey;
    
    // Add event listener for changes
    textarea.addEventListener("change", () => {
        const keys = textarea.value
            .split(/[\n;]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
        
        textarea.value = keys.join("\n");
        
        if (keys.length === 0) {
            return void saveKey(customKeysKey, keys.join("\n"));
        }
        
        const firstKey = keys[0];
        secretsFunctions.writeSecret(SOURCE_TO_SECRET_KEY[source], firstKey);
        saveKey(customKeysKey, keys.join("\n"));
        
        // Update UI
        currentKeyDiv.textContent = `Current Key: ${firstKey}`;
        lastKeyDiv.textContent = `Last Key: ${keys[keys.length - 1] || ""}`;
    });
    
    // Set initial value
    textarea.value = secrets[customKeysKey] || "";
    flexContainer.appendChild(textarea);
    
    // Create info panel
    const infoPanel = document.createElement("div");
    const infoPanelHeading = document.createElement("h4");
    infoPanelHeading.textContent = "Key Usage Information:";
    infoPanel.appendChild(infoPanelHeading);
    
    // Current key display
    const currentKeyDiv = document.createElement("div");
    currentKeyDiv.textContent = `Current Key: ${secrets[SOURCE_TO_SECRET_KEY[source]] || ""}`;
    currentKeyDiv.id = `current_key_${source}`;
    
    // Last used key display
    const lastKeyDiv = document.createElement("div");
    const lastKey = secrets[customKeysKey]?.split("\n").pop() || "";
    lastKeyDiv.textContent = `Last Key: ${lastKey}`;
    lastKeyDiv.id = `last_key_${source}`;
    
    // Key switching status
    const switchStatusDiv = document.createElement("div");
    switchStatusDiv.textContent = `Key Switching: ${keySwitchingEnabled[source] ? "On" : "Off"}`;
    switchStatusDiv.id = `switch_key_${source}`;
    
    // Error toggle status
    const errorToggleDiv = document.createElement("div");
    errorToggleDiv.textContent = `Error Details: ${showErrorDetails[source] ? "On" : "Off"}`;
    errorToggleDiv.id = `show_${source}_error`;
    
    // Add elements to info panel
    infoPanel.appendChild(currentKeyDiv);
    infoPanel.appendChild(lastKeyDiv);
    infoPanel.appendChild(switchStatusDiv);
    infoPanel.appendChild(errorToggleDiv);
    
    // Add panels to form
    form.appendChild(infoPanel);
    form.appendChild(flexContainer);
    
    // Create buttons
    const saveKeysButton = await createButton("Save Keys", async () => {
        const keys = textarea.value
            .split(/[\n;]/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
        
        textarea.value = keys.join("\n");
        
        if (keys.length === 0) {
            return void saveKey(customKeysKey, keys.join("\n"));
        }
        
        const firstKey = keys[0];
        secretsFunctions.writeSecret(SOURCE_TO_SECRET_KEY[source], firstKey);
        saveKey(customKeysKey, keys.join("\n"));
        
        // Update UI
        currentKeyDiv.textContent = `Current Key: ${firstKey}`;
        lastKeyDiv.textContent = `Last Key: ${keys[keys.length - 1] || ""}`;
    });
    
    const keySwitchingButton = await createButton("Key Switching Settings", async () => {
        keySwitchingEnabled[source] = !keySwitchingEnabled[source];
        localStorage.setItem(`switch_key_${source}`, keySwitchingEnabled[source].toString());
        switchStatusDiv.textContent = `Key Switching: ${keySwitchingEnabled[source] ? "On" : "Off"}`;
    });
    
    const viewErrorButton = await createButton("View Error Info", async () => {
        showErrorPopup("", source);
    });
    
    const errorToggleButton = await createButton("Error Details Toggle", async () => {
        showErrorDetails[source] = !showErrorDetails[source];
        localStorage.setItem(`show_${source}_error`, showErrorDetails[source].toString());
        errorToggleDiv.textContent = `Error Details: ${showErrorDetails[source] ? "On" : "Off"}`;
    });
    
    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("flex-container", "flex");
    buttonContainer.appendChild(saveKeysButton);
    buttonContainer.appendChild(keySwitchingButton);
    buttonContainer.appendChild(viewErrorButton);
    buttonContainer.appendChild(errorToggleButton);
    
    // Add button container to form
    form.appendChild(buttonContainer);
    form.appendChild(document.createElement("hr"));
}

// jQuery ready function to initialize the plugin
jQuery(async () => {
    console.log("API KeySwitcher: jQuery ready, initializing...");
    
    // Override the default toastr.error to catch API errors
    const originalToastrError = toastr.error;
    toastr.error = function(...args) {
        originalToastrError(...args);
        console.log(args);
        console.error(...args);
        
        const [errorMessage, errorTitle] = args;
        if (errorTitle && errorTitle === "Chat Completion API") {
            // Find the current source based on oai_settings
            const source = getSourceFromSettings();
            
            if (isKeySwitchingSource(source) && showErrorDetails[source]) {
                const lastKeyElement = $(`#last_key_${source}`)[0];
                showErrorPopup(`<h3>Chat Completion API Error</h3>
                    <p>${errorMessage}</p>
                    <p>${lastKeyElement ? lastKeyElement.textContent : ""}</p>`, source);
            }
        }
    };
    
    // Get the current source from settings
    function getSourceFromSettings() {
        const completionSource = oaiFunctions.oai_settings.chat_completion_source;
        
        for (const [key, value] of Object.entries(SOURCE_TO_CHAT_COMPLETION)) {
            if (value === completionSource) {
                return key;
            }
        }
        
        return KEY_SWITCHING_SOURCES.OPENROUTER; // Default fallback
    }
    
    // Get secrets
    const secrets = await getSecrets() || {};
    await init(secrets);
    
    // Create UIs for all supported providers
    for (const source of Object.values(KEY_SWITCHING_SOURCES)) {
        const formElement = $(SOURCE_TO_FORM[source])[0];
        if (formElement) {
            await createSourceUI(source, formElement);
        }
    }
    
    // Setup event listeners for all sources
    for (const source of Object.values(KEY_SWITCHING_SOURCES)) {
        const chatCompletionSource = SOURCE_TO_CHAT_COMPLETION[source];
        
        if (chatCompletionSource) {
            // Create custom event handler for this source
            scriptFunctions.eventSource.on(scriptFunctions.event_types.CHAT_COMPLETION_SETTINGS_READY, async () => {
                if (oaiFunctions.oai_settings.chat_completion_source === chatCompletionSource) {
                    await handleKeyRotation(source);
                }
            });
        }
    }
});

// Export the plugin's init function
export default exports.default; 
