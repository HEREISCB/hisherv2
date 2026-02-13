// AI Assistant Module - Custom Voice & Chat Interface

const ASSISTANT_ID = 'c0333833-55ce-4899-8602-53890dbaeb74';
const PUBLIC_KEY = 'a79b139e-f2a6-4bf5-b986-6fc79f24c74e';

let vapi = null;
let isCallActive = false;
let isSpeaking = false;

export function initAssistant() {
    createBubbleUI();
    setupEventListeners();
}

function createBubbleUI() {
    const bubbleHTML = `
        <div id="ai-assistant-container">
            <!-- Main Bubble -->
            <button id="ai-bubble" aria-label="Talk to Velina">
                <div class="bubble-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                </div>
                <span class="bubble-label">Ask Velina</span>
            </button>

            <!-- Options Menu -->
            <div id="ai-options" class="hidden">
                <div class="options-header">
                    <span>How would you like to connect?</span>
                    <button id="close-options" aria-label="Close">&times;</button>
                </div>
                <div class="options-buttons">
                    <button id="option-voice" class="option-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3H19c0 3.53-2.87 6.43-6.4 6.93V21h-1.2v-3.07c-3.53-.5-6.4-3.4-6.4-6.93h1.09c0 3.03 2.48 5.5 5.51 5.5s5.51-2.47 5.51-5.5z"/>
                        </svg>
                        <span>Talk to Velina</span>
                    </button>
                    <button id="option-chat" class="option-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                        <span>Chat with Velina</span>
                    </button>
                </div>
            </div>

            <!-- Voice Call Interface (Simplified - No Transcript) -->
            <div id="ai-voice-panel" class="hidden">
                <div class="voice-header">
                    <div class="voice-avatar">
                        <div class="avatar-ring" id="avatar-ring"></div>
                        <div class="avatar-icon">V</div>
                    </div>
                    <div class="voice-info">
                        <span class="voice-name">Velina</span>
                        <span class="voice-status" id="voice-status">Connecting...</span>
                    </div>
                    <button id="end-call" class="end-call-btn" aria-label="End Call">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Chat Interface -->
            <div id="ai-chat-panel" class="hidden">
                <div class="chat-header">
                    <div class="chat-avatar">V</div>
                    <div class="chat-info">
                        <span class="chat-name">Velina</span>
                        <span class="chat-tagline">Your Co-Living Concierge</span>
                    </div>
                    <button id="close-chat" class="close-chat-btn" aria-label="Close Chat">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message assistant">
                        <p>Hey! Welcome to HisHer. I'm Velina, how can I help you today?</p>
                    </div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type a message..." />
                    <button id="send-chat" aria-label="Send">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bubbleHTML);
}

function setupEventListeners() {
    const bubble = document.getElementById('ai-bubble');
    const options = document.getElementById('ai-options');
    const closeOptions = document.getElementById('close-options');
    const optionVoice = document.getElementById('option-voice');
    const optionChat = document.getElementById('option-chat');
    const voicePanel = document.getElementById('ai-voice-panel');
    const chatPanel = document.getElementById('ai-chat-panel');
    const endCall = document.getElementById('end-call');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');

    // Toggle options menu
    bubble.addEventListener('click', () => {
        if (isCallActive) {
            voicePanel.classList.remove('hidden');
        } else {
            options.classList.toggle('hidden');
        }
    });

    closeOptions.addEventListener('click', () => {
        options.classList.add('hidden');
    });

    // Voice option
    optionVoice.addEventListener('click', () => {
        options.classList.add('hidden');
        voicePanel.classList.remove('hidden');
        startVoiceCall();
    });

    // Chat option
    optionChat.addEventListener('click', () => {
        options.classList.add('hidden');
        chatPanel.classList.remove('hidden');
    });

    // End voice call
    endCall.addEventListener('click', () => {
        endVoiceCall();
        voicePanel.classList.add('hidden');
    });

    // Close chat
    closeChat.addEventListener('click', () => {
        chatPanel.classList.add('hidden');
    });

    // Send chat message
    sendChat.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
        const container = document.getElementById('ai-assistant-container');
        if (!container.contains(e.target)) {
            options.classList.add('hidden');
        }
    });
}

async function startVoiceCall() {
    updateVoiceStatus('Requesting microphone...');

    // Explicitly request microphone permission FIRST
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed to get permission
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        updateVoiceStatus('Microphone access denied');
        return; // Exit if permission denied
    }

    updateVoiceStatus('Connecting...');

    // Initialize Vapi if not already done
    if (!vapi) {
        // Lazy-load the SDK so it does not bloat the initial bundle.
        const { default: Vapi } = await import('@vapi-ai/web');
        vapi = new Vapi(PUBLIC_KEY);
        setupVapiEvents();
    }

    try {
        // Start the call - Vapi will now have microphone access
        await vapi.start(ASSISTANT_ID);
        isCallActive = true;
    } catch (error) {
        updateVoiceStatus('Connection failed');
    }
}

function setupVapiEvents() {
    vapi.on('call-start', () => {
        updateVoiceStatus('Connected - Speak now');
        isCallActive = true;
    });

    vapi.on('call-end', () => {
        updateVoiceStatus('Call ended');
        isCallActive = false;
        isSpeaking = false;
        updateAvatarRing(false);
    });

    vapi.on('speech-start', () => {
        isSpeaking = true;
        updateVoiceStatus('Velina is speaking...');
        updateAvatarRing(true);
    });

    vapi.on('speech-end', () => {
        isSpeaking = false;
        updateVoiceStatus('Speak now...');
        updateAvatarRing(false);
    });

    vapi.on('error', (error) => {
        if (error.message?.includes('microphone') || error.message?.includes('permission')) {
            updateVoiceStatus('Microphone access required');
        } else {
            updateVoiceStatus('Connection error');
        }
    });
}

function endVoiceCall() {
    if (vapi) {
        vapi.stop();
    }
    isCallActive = false;
    isSpeaking = false;
}

function updateVoiceStatus(status) {
    const statusEl = document.getElementById('voice-status');
    if (statusEl) {
        statusEl.textContent = status;
    }
}

function updateAvatarRing(active) {
    const ring = document.getElementById('avatar-ring');
    if (ring) {
        if (active) {
            ring.classList.add('speaking');
        } else {
            ring.classList.remove('speaking');
        }
    }
}

// Chat API - using Private API key (same as public for web widget)
const CHAT_API_KEY = '582900c6-1ab7-467c-9f1e-ea160830a629';
let lastChatId = null;

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage('user', message);
    input.value = '';

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        const response = await streamChatResponse(message);
        removeTypingIndicator(typingId);
        // Response is already added via streaming
    } catch (error) {
        removeTypingIndicator(typingId);
        addChatMessage('assistant', "I'm having trouble connecting right now. Please try again or use the voice option.");
    }
}

async function streamChatResponse(message) {
    const response = await fetch('https://api.vapi.ai/chat', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CHAT_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assistantId: ASSISTANT_ID,
            input: message,
            stream: true,
            ...(lastChatId && { previousChatId: lastChatId })
        })
    });

    if (!response.ok) {
        throw new Error('Chat request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let fullContent = '';
    let messageElement = null;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const event = JSON.parse(line.slice(6));

                    // Capture chat ID for context
                    if (event.id && !lastChatId) {
                        lastChatId = event.id;
                    }

                    // Stream the content delta
                    if (event.delta) {
                        fullContent += event.delta;

                        if (!messageElement) {
                            messageElement = createStreamingMessage();
                        }
                        updateStreamingMessage(messageElement, fullContent);
                    }
                } catch (e) {
                    // Ignore parse errors for incomplete chunks
                }
            }
        }
    }

    return fullContent;
}

function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `<p><span class="dot"></span><span class="dot"></span><span class="dot"></span></p>`;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    return 'typing-indicator';
}

function removeTypingIndicator(id) {
    const typing = document.getElementById(id);
    if (typing) typing.remove();
}

function createStreamingMessage() {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant streaming';
    msgDiv.innerHTML = `<p></p>`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    return msgDiv;
}

function updateStreamingMessage(element, text) {
    const p = element.querySelector('p');
    if (p) {
        p.textContent = text;
    }
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

function addChatMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

export default { initAssistant };
