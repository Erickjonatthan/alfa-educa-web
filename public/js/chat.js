import { API_URL } from "./const.js";

const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotBox = document.getElementById('chatbot-box');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');

// Mensagem padrão inicial
function showDefaultMessage() {
    if (chatbotMessages && chatbotMessages.innerHTML.trim() === '') {
        chatbotMessages.innerHTML = `<div style='margin-bottom:6px; color:#c98300;'><b>Fadu:</b> Surgiu alguma dúvida? Vamos conversar!</div>`;
    }
}

showDefaultMessage();

chatbotToggle.addEventListener('click', function() {
    chatbotBox.style.display = chatbotBox.style.display === 'none' ? 'block' : 'none';
    if (chatbotBox.style.display === 'block') {
        showDefaultMessage();
    }
});

chatbotForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const mensagem = chatbotInput.value.trim();
    if (!mensagem) return;

    // Adicionar mensagem do usuário
    chatbotMessages.innerHTML += `<div style='margin-bottom:6px;'><b>Você:</b> ${mensagem}</div>`;
    chatbotInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // Adicionar indicador de "digitando"
    const typingId = Date.now();
    chatbotMessages.innerHTML += `<div id="typing-${typingId}" style='margin-bottom:6px; color:#c98300;'><b>Fadu:</b> <span class="typing-dots">Digitando<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span></div>`;
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    const chatData = {
        contexto: 'site',
        mensagem: mensagem
    };

    // Obter token do localStorage para autenticação
    const token = localStorage.getItem('token');
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Adicionar Authorization header se token existir
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}llm/send_mensagem`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(chatData)
        });

        let data;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                data = await response.json();
            } else {
                const textResponse = await response.text();
                data = { erro: textResponse || `Resposta vazia - Status ${response.status}` };
            }
        } catch (jsonError) {
            data = { erro: `Erro ao processar resposta - Status ${response.status}: ${response.statusText}` };
        }

        // Log para debug
        console.log('Resposta da API:', data);

        if (!response.ok || (data.hasOwnProperty('sucesso') && !data.sucesso) || (data.hasOwnProperty('status') && data.status !== 'success')) {
            // Tratar erros da API
            const errorMessage = data.erro || data.message || `Erro HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // Se chegou até aqui, assumir sucesso
        const resposta = data.resposta || data.message || data.texto || 'Resposta recebida.';
        
        // Remover indicador de digitando
        const typingElement = document.getElementById(`typing-${typingId}`);
        if (typingElement) {
            typingElement.remove();
        }
        
        // Simular digitação da resposta
        const botMessageDiv = document.createElement('div');
        botMessageDiv.style.marginBottom = '6px';
        botMessageDiv.style.color = '#c98300';
        botMessageDiv.style.display = 'flex';
        botMessageDiv.style.alignItems = 'center';
        botMessageDiv.style.gap = '8px';
        botMessageDiv.innerHTML = `
            <div style="flex: 1;">
                <b>Fadu:</b> <span id="bot-response-${typingId}"></span>
            </div>
            <button id="audio-btn-${typingId}" onclick="playAudio('${typingId}')"
                style="background: none; border: none; color: #c98300; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 50%; transition: all 0.2s ease; display: none;"
                title="Ouvir mensagem">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        chatbotMessages.appendChild(botMessageDiv);
        
        await typeWriterEffect(`bot-response-${typingId}`, resposta);
        
        // Mostrar botão de áudio após terminar de digitar
        const audioBtn = document.getElementById(`audio-btn-${typingId}`);
        if (audioBtn) {
            audioBtn.style.display = 'block';
        }

    } catch (error) {
        // Remover indicador de digitando em caso de erro
        const typingElement = document.getElementById(`typing-${typingId}`);
        if (typingElement) {
            typingElement.remove();
        }
        
        console.log('Erro ao enviar mensagem para o chat: ' + error.message);
        chatbotMessages.innerHTML += `<div style='margin-bottom:6px; color:#d00;'><b>Fadu:</b> Erro ao conectar ao assistente. Tente novamente.</div>`;
    } finally {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});

// Função para efeito de digitação
async function typeWriterEffect(elementId, text, speed = 30) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let i = 0;
    while (i < text.length) {
        element.textContent += text.charAt(i);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        i++;
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// Função para reproduzir áudio usando Web Speech API
function playAudio(messageId) {
    const textElement = document.getElementById(`bot-response-${messageId}`);
    const audioBtn = document.getElementById(`audio-btn-${messageId}`);
    
    if (!textElement || !textElement.textContent) return;
    
    // Verificar se o navegador suporta a Web Speech API
    if (!('speechSynthesis' in window)) {
        alert('Seu navegador não suporta síntese de voz.');
        return;
    }
    
    // Parar qualquer fala anterior
    speechSynthesis.cancel();
    
    // Criar nova instância de fala
    const utterance = new SpeechSynthesisUtterance(textElement.textContent);
    
    // Configurar a voz
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; // Velocidade da fala
    utterance.pitch = 1; // Tom da voz
    utterance.volume = 0.8; // Volume
    
    // Mudanças visuais durante a reprodução
    audioBtn.innerHTML = '<i class="fas fa-pause"></i>';
    audioBtn.style.color = '#c98300';
    audioBtn.title = 'Pausar áudio';
    
    // Eventos da síntese de voz
    utterance.onstart = () => {
        audioBtn.onclick = () => stopAudio(messageId);
    };
    
    utterance.onend = () => {
        resetAudioButton(messageId);
    };
    
    utterance.onerror = () => {
        resetAudioButton(messageId);
        console.error('Erro na síntese de voz');
    };
    
    // Iniciar a reprodução
    speechSynthesis.speak(utterance);
}

// Função para parar o áudio
function stopAudio(messageId) {
    speechSynthesis.cancel();
    resetAudioButton(messageId);
}

// Função para resetar o botão de áudio
function resetAudioButton(messageId) {
    const audioBtn = document.getElementById(`audio-btn-${messageId}`);
    if (audioBtn) {
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioBtn.style.color = '#c98300';
        audioBtn.title = 'Ouvir mensagem';
        audioBtn.onclick = () => playAudio(messageId);
    }
}

// Adicionar estilos CSS para animação de digitando
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: inline-block;
    }
    .typing-dots .dot {
        animation: typing 1.4s infinite;
        opacity: 0;
    }
    .typing-dots .dot:nth-child(2) {
        animation-delay: 0.2s;
    }
    .typing-dots .dot:nth-child(3) {
        animation-delay: 0.4s;
    }
    @keyframes typing {
        0%, 60%, 100% {
            opacity: 0;
        }
        30% {
            opacity: 1;
        }
    }
    #chatbot-toggle {
        background: #c98300 !important;
    }
    #chatbot-toggle:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(201, 131, 0, 0.4) !important;
    }
    #chatbot-form button {
        background: #c98300 !important;
        color: #fff !important;
    }
    #chatbot-form button:hover {
        background: #a86a00 !important;
    }
    [id^="audio-btn-"] {
        color: #c98300 !important;
    }
    [id^="audio-btn-"]:hover {
        background: rgba(201, 131, 0, 0.1) !important;
        transform: scale(1.1);
    }
    [id^="audio-btn-"]:active {
        transform: scale(0.95);
    }
    #chatbot-box {
        border: 2px solid #c98300 !important;
        box-shadow: 0 4px 20px rgba(201, 131, 0, 0.2) !important;
    }
    #chatbot-box > div:first-child {
        background: linear-gradient(135deg, #c98300, #a86a00) !important;
        color: #fff !important;
    }
    #chatbot-messages::-webkit-scrollbar-thumb {
        background: #c98300 !important;
    }
    #chatbot-messages::-webkit-scrollbar-thumb:hover {
        background: #a86a00 !important;
    }
`;
document.head.appendChild(style);

// Tornar as funções de áudio globais para acesso via onclick
window.playAudio = playAudio;
window.stopAudio = stopAudio;
