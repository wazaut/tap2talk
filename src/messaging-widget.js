/**
 * Messaging Widget Multi-Canal v1.0.0
 * Widget embebible para integrar múltiples canales de mensajería
 */

class MessagingWidget {
  constructor() {
    this.config = {};
    this.isOpen = false;
    this.shadowRoot = null;
    this.analytics = [];
    this.socket = null;
    this.chatMessages = [];
    this.isInitialized = false;
  }

  init(config = {}) {
    if (this.isInitialized) return;

    this.config = this.mergeConfig(config);
    this.createWidget();
    this.bindEvents();
    this.initInternalChat();
    this.trackEvent('widget_initialized');
    this.isInitialized = true;

    if (this.config.hooks.onInit) this.config.hooks.onInit();
  }

  mergeConfig(userConfig) {
    const defaultConfig = {
      channels: {
        whatsapp: {
          enabled: true,
          number: '+56932027928',
          message: '¡Hola! Me gustaría obtener más información.',
        },
        instagram: { enabled: true, username: '@wazaut' },
        messenger: { enabled: true, pageId: '608983195635240' },
        internalChat: { enabled: true, socketUrl: null },
      },
      appearance: {
        position: 'bottom-right',
        primaryColor: '#25D366',
        secondaryColor: '#128C7E',
        buttonSize: 60,
        zIndex: 9999,
      },
      internalChat: {
        title: 'Chat de Soporte',
        placeholder: 'Escribe tu mensaje...',
        welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?',
      },
      hooks: { onInit: null, onChatOpen: null, onMessageSend: null, onChatClose: null },
      analytics: { enabled: true, trackClicks: true, trackMessages: true, endpoint: null },
    };

    return this.deepMerge(defaultConfig, userConfig);
  }

  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  createWidget() {
    const container = document.createElement('div');
    container.id = 'messaging-widget-container';
    this.shadowRoot = container.attachShadow({ mode: 'closed' });

    const styles = this.createStyles();
    this.shadowRoot.appendChild(styles);

    const widget = this.createWidgetStructure();
    this.shadowRoot.appendChild(widget);

    document.body.appendChild(container);
  }

  createStyles() {
    const style = document.createElement('style');
    const { appearance } = this.config;
    const position = this.getPositionStyles(appearance.position);

    style.textContent = `
            * { box-sizing: border-box; }
            .widget-container { position: fixed; ${position} z-index: ${
      appearance.zIndex
    }; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .main-button { width: ${appearance.buttonSize}px; height: ${
      appearance.buttonSize
    }px; background: ${
      appearance.primaryColor
    }; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease; border: none; position: relative; overflow: hidden; }
            .main-button:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
            .main-button svg { width: 24px; height: 24px; fill: white; }
            .channels-menu { position: absolute; bottom: ${
              appearance.buttonSize + 10
            }px; right: 0; background: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.3s ease; min-width: 200px; overflow: hidden; }
            .channels-menu.open { opacity: 1; visibility: visible; transform: translateY(0); }
            .channel-item { display: flex; align-items: center; padding: 12px 16px; cursor: pointer; transition: background 0.2s ease; border-bottom: 1px solid #f0f0f0; color: #333; }
            .channel-item:last-child { border-bottom: none; }
            .channel-item:hover { background: #f8f9fa; }
            .channel-icon { width: 24px; height: 24px; margin-right: 12px; flex-shrink: 0; }
            .channel-name { font-size: 14px; font-weight: 500; }
            .chat-window { position: absolute; bottom: 0; right: 0; width: 350px; height: 500px; background: white; border-radius: 12px 12px 0 0; box-shadow: 0 -5px 25px rgba(0,0,0,0.15); opacity: 0; visibility: hidden; transform: translateY(100%); transition: all 0.3s ease; display: flex; flex-direction: column; overflow: hidden; }
            .chat-window.open { opacity: 1; visibility: visible; transform: translateY(0); }
            .chat-header { background: ${
              appearance.primaryColor
            }; color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
            .chat-title { font-size: 16px; font-weight: 600; }
            .close-button { background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s ease; font-size: 18px; }
            .close-button:hover { background: rgba(255,255,255,0.1); }
            .chat-messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8f9fa; }
            .message { max-width: 80%; padding: 8px 12px; border-radius: 12px; font-size: 14px; line-height: 1.4; word-wrap: break-word; }
            .message.received { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; }
            .message.sent { background: ${
              appearance.primaryColor
            }; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
            .chat-input-container { padding: 16px; border-top: 1px solid #e0e0e0; display: flex; gap: 8px; background: white; }
            .chat-input { flex: 1; border: 1px solid #e0e0e0; border-radius: 20px; padding: 8px 16px; font-size: 14px; outline: none; transition: border-color 0.2s ease; }
            .chat-input:focus { border-color: ${appearance.primaryColor}; }
            .send-button { width: 36px; height: 36px; background: ${
              appearance.primaryColor
            }; border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
            .send-button:hover { background: ${appearance.secondaryColor}; transform: scale(1.05); }
            .typing-indicator { padding: 8px 12px; background: white; border-radius: 12px; align-self: flex-start; font-style: italic; color: #666; animation: pulse 2s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
            @media (max-width: 480px) { 
                .chat-window { width: 100vw; height: 100vh; border-radius: 0; }
                .channels-menu { left: 20px; right: 20px; }
            }
        `;

    return style;
  }

  getPositionStyles(position) {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
    };
    return positions[position] || positions['bottom-right'];
  }

  createWidgetStructure() {
    const container = document.createElement('div');
    container.className = 'widget-container';

    const mainButton = document.createElement('button');
    mainButton.className = 'main-button';
    mainButton.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2Z"/></svg>`;

    const channelsMenu = document.createElement('div');
    channelsMenu.className = 'channels-menu';
    channelsMenu.appendChild(this.createChannelsMenu());

    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.appendChild(this.createChatWindow());

    container.appendChild(mainButton);
    container.appendChild(channelsMenu);
    container.appendChild(chatWindow);

    return container;
  }

  createChannelsMenu() {
    const fragment = document.createDocumentFragment();
    const { channels } = this.config;

    if (channels.whatsapp.enabled)
      fragment.appendChild(this.createChannelItem('whatsapp', 'WhatsApp', this.getWhatsAppIcon()));
    if (channels.instagram.enabled)
      fragment.appendChild(
        this.createChannelItem('instagram', 'Instagram', this.getInstagramIcon())
      );
    if (channels.messenger.enabled)
      fragment.appendChild(
        this.createChannelItem('messenger', 'Messenger', this.getMessengerIcon())
      );
    if (channels.internalChat.enabled)
      fragment.appendChild(this.createChannelItem('internal', 'Chat en vivo', this.getChatIcon()));

    return fragment;
  }

  createChannelItem(channel, name, icon) {
    const item = document.createElement('div');
    item.className = 'channel-item';
    item.dataset.channel = channel;
    item.innerHTML = `<div class="channel-icon">${icon}</div><div class="channel-name">${name}</div>`;
    return item;
  }

  createChatWindow() {
    const fragment = document.createDocumentFragment();

    const header = document.createElement('div');
    header.className = 'chat-header';
    header.innerHTML = `<div class="chat-title">${this.config.internalChat.title}</div><button class="close-button">✕</button>`;

    const messages = document.createElement('div');
    messages.className = 'chat-messages';

    if (this.config.internalChat.welcomeMessage) {
      const welcomeMsg = document.createElement('div');
      welcomeMsg.className = 'message received';
      welcomeMsg.textContent = this.config.internalChat.welcomeMessage;
      messages.appendChild(welcomeMsg);
    }

    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input-container';
    inputContainer.innerHTML = `
            <input type="text" class="chat-input" placeholder="${this.config.internalChat.placeholder}">
            <button class="send-button"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg></button>
        `;

    fragment.appendChild(header);
    fragment.appendChild(messages);
    fragment.appendChild(inputContainer);

    return fragment;
  }

  bindEvents() {
    const mainButton = this.shadowRoot.querySelector('.main-button');
    const channelsMenu = this.shadowRoot.querySelector('.channels-menu');
    const closeButton = this.shadowRoot.querySelector('.close-button');
    const sendButton = this.shadowRoot.querySelector('.send-button');
    const chatInput = this.shadowRoot.querySelector('.chat-input');

    mainButton.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleMenu();
    });
    channelsMenu.addEventListener('click', e => {
      const channelItem = e.target.closest('.channel-item');
      if (channelItem) this.openChannel(channelItem.dataset.channel);
    });
    closeButton.addEventListener('click', () => this.closeChatWindow());
    sendButton.addEventListener('click', () => this.sendMessage());
    chatInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.sendMessage();
    });
    document.addEventListener('click', () => this.closeMenu());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.closeChatWindow();
      }
    });
  }

  toggleMenu() {
    const channelsMenu = this.shadowRoot.querySelector('.channels-menu');
    this.isOpen = !this.isOpen;
    channelsMenu.classList.toggle('open', this.isOpen);
    this.trackEvent(this.isOpen ? 'menu_opened' : 'menu_closed');
  }

  closeMenu() {
    const channelsMenu = this.shadowRoot.querySelector('.channels-menu');
    channelsMenu.classList.remove('open');
    this.isOpen = false;
  }

  openChannel(channel) {
    this.closeMenu();
    this.trackEvent('channel_clicked', { channel });
    if (this.config.hooks.onChatOpen) this.config.hooks.onChatOpen(channel);

    switch (channel) {
      case 'whatsapp':
        this.openWhatsApp();
        break;
      case 'instagram':
        this.openInstagram();
        break;
      case 'messenger':
        this.openMessenger();
        break;
      case 'internal':
        this.openChatWindow();
        break;
    }
  }

  openWhatsApp() {
    const { number, message } = this.config.channels.whatsapp;
    const url = `https://wa.me/${number.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  openInstagram() {
    const url = `https://instagram.com/${this.config.channels.instagram.username}`;
    window.open(url, '_blank');
  }

  openMessenger() {
    const url = `https://m.me/${this.config.channels.messenger.pageId}`;
    window.open(url, '_blank');
  }

  openChatWindow() {
    const chatWindow = this.shadowRoot.querySelector('.chat-window');
    chatWindow.classList.add('open');
    setTimeout(() => this.shadowRoot.querySelector('.chat-input').focus(), 300);
  }

  closeChatWindow() {
    const chatWindow = this.shadowRoot.querySelector('.chat-window');
    chatWindow.classList.remove('open');
    if (this.config.hooks.onChatClose) this.config.hooks.onChatClose('internal');
  }

  sendMessage() {
    const chatInput = this.shadowRoot.querySelector('.chat-input');
    const message = chatInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'sent');
    chatInput.value = '';
    this.trackEvent('message_sent', { channel: 'internal', message });
    if (this.config.hooks.onMessageSend) this.config.hooks.onMessageSend(message, 'internal');

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'message', message, timestamp: Date.now() }));
    } else {
      this.showTypingIndicator();
      setTimeout(() => {
        this.hideTypingIndicator();
        this.addMessage('Gracias por tu mensaje. Te responderemos pronto.', 'received');
      }, 2000);
    }
  }

  addMessage(text, type) {
    const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    this.chatMessages.push({ text, type, timestamp: Date.now() });
  }

  showTypingIndicator() {
    const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.textContent = 'Escribiendo...';
    indicator.id = 'typing-indicator';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const indicator = this.shadowRoot.querySelector('#typing-indicator');
    if (indicator) indicator.remove();
  }

  initInternalChat() {
    if (this.config.channels.internalChat.socketUrl) {
      this.connectWebSocket(this.config.channels.internalChat.socketUrl);
    }
  }

  connectWebSocket(socketUrl) {
    try {
      this.socket = new WebSocket(socketUrl);
      this.socket.onopen = () => {
        console.log('WebSocket conectado');
        this.trackEvent('websocket_connected');
      };
      this.socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.addMessage(data.message, 'received');
        } catch (e) {
          this.addMessage(event.data, 'received');
        }
      };
      this.socket.onclose = () => {
        console.log('WebSocket desconectado');
        this.trackEvent('websocket_disconnected');
        setTimeout(() => this.connectWebSocket(socketUrl), 5000);
      };
      this.socket.onerror = error => {
        console.error('Error en WebSocket:', error);
        this.trackEvent('websocket_error', { error: error.message });
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  }

  trackEvent(event, data = {}) {
    if (!this.config.analytics.enabled) return;
    const eventData = {
      event,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      ...data,
    };
    this.analytics.push(eventData);
    if (this.config.analytics.endpoint) this.sendAnalytics(eventData);
    console.log('Analytics Event:', eventData);
  }

  sendAnalytics(eventData) {
    fetch(this.config.analytics.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }).catch(error => console.error('Error enviando analítica:', error));
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('messaging-widget-session');
    if (!sessionId) {
      sessionId = 'mw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('messaging-widget-session', sessionId);
    }
    return sessionId;
  }

  // Iconos SVG
  getWhatsAppIcon() {
    return `<svg fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z"/></svg>`;
  }
  getInstagramIcon() {
    return `<svg fill="#E4405F" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
  }
  getMessengerIcon() {
    return `<svg fill="#0084FF" viewBox="0 0 24 24"><path d="M12,2C6.486,2,2,6.262,2,11.5c0,2.665,1.113,5.073,2.914,6.825V22l3.539-1.935C9.507,20.352,10.727,20.5,12,20.5c5.514,0,10-4.262,10-9.5S17.514,2,12,2z M13.5,14.5l-2.5-2.667L6.5,14.5L11,9.5l2.5,2.667L17.5,9.5L13.5,14.5z"/></svg>`;
  }
  getChatIcon() {
    return `<svg fill="#6c757d" viewBox="0 0 24 24"><path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2Z"/></svg>`;
  }

  // API Pública
  destroy() {
    const container = document.getElementById('messaging-widget-container');
    if (container) container.remove();
    if (this.socket) this.socket.close();
    this.isInitialized = false;
    this.analytics = [];
    this.chatMessages = [];
  }
  getAnalytics() {
    return [...this.analytics];
  }
  updateConfig(newConfig) {
    this.config = this.mergeConfig(newConfig);
    this.destroy();
    this.isInitialized = false;
    this.init(this.config);
  }
  openChannelDirectly(channel) {
    this.openChannel(channel);
  }
  addMessageProgrammatically(message, type = 'received') {
    if (this.shadowRoot) this.addMessage(message, type);
  }
  getChatHistory() {
    return [...this.chatMessages];
  }
  clearChatHistory() {
    this.chatMessages = [];
    const messagesContainer = this.shadowRoot?.querySelector('.chat-messages');
    if (messagesContainer) {
      const welcomeMessage = messagesContainer.querySelector('.message.received');
      messagesContainer.innerHTML = '';
      if (welcomeMessage && this.config.internalChat.welcomeMessage)
        messagesContainer.appendChild(welcomeMessage);
    }
  }
  isReady() {
    return this.isInitialized;
  }
}

// Create and export a singleton instance
const widget = new MessagingWidget();

// For backwards compatibility and direct browser usage
if (typeof window !== 'undefined') {
  window.MessagingWidget = widget;
}

export default widget;
