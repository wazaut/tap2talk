const { describe, test, expect, beforeEach } = require('@jest/globals');
const MessagingWidget = require('../src/messaging-widget');

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor() {
    this.readyState = WebSocket.OPEN;
  }
  send() {}
  close() {}
};
global.WebSocket.OPEN = 1;

// Mock sessionStorage
global.sessionStorage = {
  getItem: () => {},
  setItem: () => {},
};

// Mock window.location
global.window = {
  location: {
    href: 'http://localhost',
  },
};

// Mock navigator
global.navigator = {
  userAgent: 'test',
};

// Mock document
global.document = {
  body: {
    innerHTML: '',
    appendChild: () => {},
  },
  createElement: () => ({
    attachShadow: () => ({
      appendChild: () => {},
    }),
    className: '',
    id: '',
    innerHTML: '',
  }),
};

// Mock fetch
global.fetch = () =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  });

describe('MessagingWidget', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    MessagingWidget.destroy();
  });

  test('se inicializa correctamente', () => {
    MessagingWidget.init();
    expect(MessagingWidget.isReady()).toBe(true);
  });

  test('maneja la configuración personalizada', () => {
    const config = {
      channels: {
        whatsapp: {
          enabled: true,
          number: '+56932027928',
        },
      },
    };
    MessagingWidget.init(config);
    expect(MessagingWidget.config.channels.whatsapp.number).toBe('+56932027928');
  });

  test('puede agregar mensajes programáticamente', () => {
    MessagingWidget.init();
    const mensaje = 'Test message';
    MessagingWidget.addMessageProgrammatically(mensaje);
    const historial = MessagingWidget.getChatHistory();
    expect(historial).toHaveLength(1);
    expect(historial[0].text).toBe(mensaje);
  });
}); 