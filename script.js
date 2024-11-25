const qaArray = [
    {
        question: "Schedule for Garbage Pickup in the Villanueva Area.",
        answer: "PickUp Days: Saturday\nPickUp Time: 6:45AM - 8:30AM\nNote:\n   *Please ensure that garbage is placed outside by the designated time.\n   *Use approved garbage bins and separate recyclables when possible."
    },
    {
        question: "Garbage Pickup Schedule for All Villanueva Barangays.",
        answer: "PickUp Days: Monday, Wednesday, Friday\nPickUp Time: 6:45AM - 8:30AM"
    },
    {
        question: "Are there any changes to the pickup schedule for holidays?",
        answer: "There will be no waste pickups on holidays. Please plan accordingly, and refer to the updated schedule for the next available pickup date."
    },
    {
        question: "What are the fees for garbage collection, and how can I pay?",
        answer: "The garbage collection fee is 500, and additional charges may apply from the garbage collector. You can pay directly to the garbage collector or through the payment methods they provide."
    },
    {
        question: "Plumbing Services",
        answer: "Hi, I'm Axion. How can I help you with plumbing services?",
    },
    {
        question: "Carpentry Services",
        answer: "Hi, I'm Axion. How can I help you with carpentry services?",
    },
    {
        question: "Who are you?",
        answer: "Hi, I'm Axion. I'm here to help you with your garbage disposal, plumbing, and carpentry needs.",
    },
    {
        question: "Who are you",
        answer: "Hi, I'm Axion. I'm here to help you with your garbage disposal, plumbing, and carpentry needs.",
    },

];

// Garbage Pickup Addresses
const garbagePickupAddresses = [
    "villanueva", "dayawan", "san martin", "imelda", "poblacion 1", "pob 2",
    "pob 3", "pob 4", "looc", "tambobong", "kimaya", "katipunan", "balacanas"
];

// DOM Elements
const messageForm = document.querySelector(".prompt__form");
const chatHistoryContainer = document.querySelector(".chats");
const themeToggleButton = document.getElementById("themeToggler");
const clearChatButton = document.getElementById("deleteButton");

// State Variables
let currentUserMessage = null;
let isGeneratingResponse = false;

// Mock Secure API Key Fetch (for demonstration)
const fetchApiKey = async () => {
    return "AIzaSyCOb8OTbW2wlWIhC2MQ69surifcQcd0XqA";
};

// Load Saved Chat History
const loadSavedChatHistory = () => {
    const savedConversations = JSON.parse(localStorage.getItem("saved-api-chats")) || [];
    const isLightTheme = localStorage.getItem("themeColor") === "light_mode";

    document.body.classList.toggle("light_mode", isLightTheme);
    themeToggleButton.setAttribute("aria-label", isLightTheme ? "Switch to dark mode" : "Switch to light mode");
    themeToggleButton.innerHTML = isLightTheme ? '<i class="bx bx-moon"></i>' : '<i class="bx bx-sun"></i>';

    chatHistoryContainer.innerHTML = '';

    savedConversations.forEach(({ userMessage, apiResponse }) => {
        addChatMessage(userMessage, "outgoing");
        addChatMessage(apiResponse, "incoming");
    });

    document.body.classList.toggle("hide-header", savedConversations.length > 0);
};

// Add Chat Message
const addChatMessage = (message, type) => {
    const isOutgoing = type === "outgoing";
    const avatar = isOutgoing ? "profile.png" : "robot.png";
    const ariaLabel = isOutgoing ? "User message" : "System response";

    const messageHtml = `
        <div class="message__content" aria-label="${ariaLabel}" role="region">
            <img class="message__avatar" src="assets/${avatar}" alt="${ariaLabel}">
            <p class="message__text">${message}</p>
        </div>
    `;
    const cssClass = isOutgoing ? "message--outgoing" : "message--incoming";
    chatHistoryContainer.appendChild(createChatMessageElement(messageHtml, cssClass));
};

// Create Chat Message Element
const createChatMessageElement = (htmlContent, ...cssClasses) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", ...cssClasses);
    messageElement.innerHTML = htmlContent;
    return messageElement;
};


// Clear Chat History
clearChatButton.addEventListener("click", () => {
    if (isGeneratingResponse || !confirm("Clear all conversation history?")) return;
    chatHistoryContainer.innerHTML = '';
    document.body.classList.remove("hide-header");
    localStorage.removeItem("saved-api-chats");
});

// Display Loading Animation
const displayLoadingAnimation = () => {
    const loadingHtml = `
        <div class="message__content" role="region" aria-label="Processing response">
            <img class="message__avatar" src="assets/robot.png" alt="Loading">
            <p class="message__text">Processing your request...</p>
        </div>
    `;
    const loadingMessageElement = createChatMessageElement(loadingHtml, "message--incoming", "message--loading");
    chatHistoryContainer.appendChild(loadingMessageElement);

    fetchResponse(loadingMessageElement);
};

// Fetch Response
const fetchResponse = async (loadingElement) => {
    const messageTextElement = loadingElement.querySelector(".message__text");

    if (!currentUserMessage) return;

    const address = garbagePickupAddresses.find(address =>
        currentUserMessage.toLowerCase().includes(address)
    );

    // Check if the message is related to Plumber or Carpenter services
    if (currentUserMessage.toLowerCase().includes("plumber") || currentUserMessage.toLowerCase().includes("carpenter")) {
        if (!address) {
            messageTextElement.innerText = "Please provide your address to proceed (e.g., Villanueva, Dayawan, San Martin).";
        } else {
            messageTextElement.innerText = `Request submitted for ${currentUserMessage.toLowerCase().includes("plumber") ? "Plumber" : "Carpenter"} services at ${address}. Be ready to pay the service charge fee for them.`;
        }
        loadingElement.classList.remove("message--loading");
        isGeneratingResponse = false;
        return;
    }

    // Existing checks for garbage collection or predefined responses
    if (currentUserMessage.toLowerCase().includes("garbage collection") || 
        currentUserMessage.toLowerCase().includes("need this garbage to be picked up")) {
        messageTextElement.innerText = address
            ? `Request submitted for garbage collection at ${address}. Be ready to pay the service charge fee of 500.`
            : "Please provide your address to proceed (e.g., Villanueva, Dayawan, San Martin).";
        loadingElement.classList.remove("message--loading");
        isGeneratingResponse = false;
        return;
    }

    // Check predefined responses in the QA array
    const predefinedResponse = qaArray.find(qa =>
        currentUserMessage.toLowerCase().includes(qa.question.toLowerCase())
    );

    if (predefinedResponse) {
        messageTextElement.innerText = predefinedResponse.answer;
        loadingElement.classList.remove("message--loading");
        isGeneratingResponse = false;
        return;
    }

    try {
        const apiKey = await fetchApiKey(); // Fetch API key securely

        const requestBody = {
            prompt: currentUserMessage // Sending the user's message directly as "prompt"
        };

        // Send POST request to the API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(errorData.error?.message || "Unable to process your request.");
        }

        const responseData = await response.json(); // Parse the response JSON
        const responseText = responseData?.text || "Sorry, I couldn't process your request.";
        messageTextElement.innerText = responseText;
    } catch (error) {
        console.error("Fetch Error:", error);

        messageTextElement.innerText =
            "We're experiencing issues processing your request. Please try again later or ask a specific question about garbage collection schedules.";
        loadingElement.classList.add("message--error");
    } finally {
        loadingElement.classList.remove("message--loading");
        isGeneratingResponse = false;
    }
};

// Handle Message Submission
messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    currentUserMessage = messageForm.querySelector(".prompt__form-input").value.trim();
    if (!currentUserMessage || isGeneratingResponse) return;

    addChatMessage(currentUserMessage, "outgoing");
    messageForm.reset();
    document.body.classList.add("hide-header");

    isGeneratingResponse = true;
    displayLoadingAnimation();
});

// Suggestion Click Event Handler
// Suggestion Click Event Handler
const suggestionItems = document.querySelectorAll(".suggests__item-text");

suggestionItems.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        // Capture the clicked suggestion's text
        currentUserMessage = suggestion.innerText.trim();
        
        // Clear the input field (if necessary)
        messageForm.querySelector(".prompt__form-input").value = currentUserMessage;

        // Trigger the outgoing message handler
        handleOutgoingMessage();  // Process the outgoing message based on the clicked suggestion
    });
});

// Handle Outgoing Message
const handleOutgoingMessage = () => {
    if (!currentUserMessage || isGeneratingResponse) return;

    // Add the user's message to the chat
    addChatMessage(currentUserMessage, "outgoing");

    // Reset the form (if needed)
    messageForm.reset();

    // Hide the header when a new message is added
    document.body.classList.add("hide-header");

    // Set the flag indicating the response is being generated
    isGeneratingResponse = true;

    // Display the loading animation
    displayLoadingAnimation();
};


// Initialize Chat History on Load
window.addEventListener("load", () => {
    loadSavedChatHistory();
});
