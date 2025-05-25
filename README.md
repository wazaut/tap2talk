# 🚀 Messaging Widget Multi-Canal

Widget embebible reutilizable para integrar múltiples canales de mensajería (WhatsApp, Instagram, Facebook Messenger y chat interno) en cualquier sitio web con una sola línea de código.

![Widget Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Características

- 📱 **Multi-Canal**: WhatsApp, Instagram, Facebook Messenger y chat interno
- ⚙️ **Configurable**: Personalización completa via JSON o data-attributes  
- 🎨 **Responsive**: Diseño adaptativo para desktop y móvil
- 🔒 **Seguro**: Estilos aislados con Shadow DOM
- 📊 **Analítica**: Sistema de eventos integrado
- ⚡ **Fácil**: Instalación con una línea de código
- 🌐 **Compatible**: Funciona con cualquier CMS o framework

## 🚀 Instalación Rápida

### Opción 1: Script directo

```html
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@1.0.1"></script>
<script>
  MessagingWidget.init({
    channels: {
      whatsapp: {
        enabled: true,
        number: '+1234567890',
        message: '¡Hola! Me gustaría obtener más información.'
      },
      instagram: {
        enabled: true,
        username: 'tu_usuario'
      },
      messenger: {
        enabled: true,
        pageId: 'tu_page_id'
      }
    }
  });
</script>
```

### Opción 2: Data attributes (más simple)

```html
<script 
  src="https://www.npmjs.com/package/messaging-widget/v/1.0.1"
  data-messaging-widget
  data-whatsapp="+1234567890"
  data-instagram="tu_usuario"
  data-messenger="tu_page_id"
  data-primary-color="#25D366"
  data-position="bottom-right"
></script>
```

## 📋 Configuración

### Configuración Básica

```javascript
MessagingWidget.init({
  channels: {
    whatsapp: {
      enabled: true,
      number: '+1234567890',
      message: '¡Hola! Me gustaría más información.'
    },
    instagram: {
      enabled: true,
      username: 'tu_usuario'
    },
    messenger: {
      enabled: true,
      pageId: 'tu_page_id'
    },
    internalChat: {
      enabled: true
    }
  },
  appearance: {
    position: 'bottom-right',
    primaryColor: '#25D366'
  }
});
```

### Configuración Avanzada

```javascript
MessagingWidget.init({
  channels: {
    whatsapp: {
      enabled: true,
      number: '+1234567890',
      message: '¡Hola! Me gustaría obtener más información.'
    },
    instagram: {
      enabled: true,
      username: 'tu_usuario'
    },
    messenger: {
      enabled: true,
      pageId: 'tu_page_id'
    },
    internalChat: {
      enabled: true,
      socketUrl: 'wss://wazaut.com/chat'
    }
  },
  
  appearance: {
    position: 'bottom-right', // bottom-left, top-right, top-left
    primaryColor: '#25D366',
    secondaryColor: '#128C7E',
    buttonSize: 60,
    zIndex: 9999
  },
  
  internalChat: {
    title: 'Chat de Soporte',
    placeholder: 'Escribe tu mensaje...',
    welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?'
  },
  
  hooks: {
    onInit: () => console.log('Widget inicializado'),
    onChatOpen: (channel) => console.log('Chat abierto:', channel),
    onMessageSend: (message, channel) => {
      console.log('Mensaje enviado:', message);
      // Integrar con tu backend aquí
    },
    onChatClose: (channel) => console.log('Chat cerrado:', channel)
  },
  
  analytics: {
    enabled: true,
    trackClicks: true,
    trackMessages: true,
    endpoint: 'https://wazaut.com/analytics'
  }
});
```

## 🔧 API

### Métodos Principales

```javascript
// Inicializar widget
MessagingWidget.init(config);

// Destruir widget
MessagingWidget.destroy();

// Actualizar configuración
MessagingWidget.updateConfig(newConfig);

// Verificar si está listo
MessagingWidget.isReady();
```

### Control de Chat

```javascript
// Abrir canal específico
MessagingWidget.openChannelDirectly('whatsapp');

// Añadir mensaje programáticamente
MessagingWidget.addMessageProgrammatically(
  'Hola desde código', 'received'
);

// Obtener historial de chat
const history = MessagingWidget.getChatHistory();

// Limpiar historial
MessagingWidget.clearChatHistory();
```

### Analítica

```javascript
// Obtener eventos registrados
const analytics = MessagingWidget.getAnalytics();

// Los eventos se envían automáticamente si tienes
// configurado analytics.endpoint
console.log(analytics);
```

## 🌐 Integraciones

### React

```jsx
import { useEffect } from 'react';

const useMessagingWidget = (config) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/messaging-widget@1.0.1';
    script.onload = () => {
      window.MessagingWidget.init(config);
    };
    document.head.appendChild(script);
    
    return () => {
      if (window.MessagingWidget) {
        window.MessagingWidget.destroy();
      }
    };
  }, [config]);
};

function App() {
  useMessagingWidget({
    channels: {
      whatsapp: { enabled: true, number: '+1234567890' }
    }
  });
  
  return <div>Tu aplicación</div>;
}
```

### WordPress

```php
// functions.php
function add_messaging_widget() {
    ?>
    <script src="https://cdn.jsdelivr.net/npm/messaging-widget@1.0.1"></script>
    <script>
    MessagingWidget.init({
      channels: {
        whatsapp: {
          enabled: true,
          number: '<?php echo get_option('whatsapp_number', '+1234567890'); ?>'
        }
      }
    });
    </script>
    <?php
}
add_action('wp_footer', 'add_messaging_widget');
```

### Vue.js

```vue
<template>
  <div>
    <!-- Tu componente -->
  </div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/messaging-widget@1.0.1';
    script.onload = () => {
      window.MessagingWidget.init({
        channels: {
          whatsapp: { enabled: true, number: '+1234567890' }
        }
      });
    };
    document.head.appendChild(script);
  },
  
  beforeDestroy() {
    if (window.MessagingWidget) {
      window.MessagingWidget.destroy();
    }
  }
}
</script>
```

## 📁 Estructura del Proyecto

```
messaging-widget/
├── js/
│   └── messaging-widget.js    # Widget principal
├── css/
│   └── messaging-widget.css   # Estilos opcionales
├── examples/
│   ├── basic.html            # Ejemplo básico
│   └── advanced.html         # Ejemplo avanzado
├── index.html               # Demo principal
└── README.md               # Este archivo
```

## ⚙️ Opciones de Configuración

| Opción | Tipo | Defecto | Descripción |
|--------|------|---------|-------------|
| `channels.whatsapp.enabled` | boolean | `true` | Habilitar WhatsApp |
| `channels.whatsapp.number` | string | `'+1234567890'` | Número de WhatsApp |
| `channels.whatsapp.message` | string | `'¡Hola!'` | Mensaje predefinido |
| `channels.instagram.enabled` | boolean | `true` | Habilitar Instagram |
| `channels.instagram.username` | string | `'usuario'` | Usuario de Instagram |
| `channels.messenger.enabled` | boolean | `true` | Habilitar Messenger |
| `channels.messenger.pageId` | string | `'page_id'` | ID de página de Facebook |
| `channels.internalChat.enabled` | boolean | `true` | Habilitar chat interno |
| `channels.internalChat.socketUrl` | string | `null` | URL del WebSocket |
| `appearance.position` | string | `'bottom-right'` | Posición del widget |
| `appearance.primaryColor` | string | `'#25D366'` | Color primario |
| `appearance.secondaryColor` | string | `'#128C7E'` | Color secundario |
| `appearance.buttonSize` | number | `60` | Tamaño del botón |
| `appearance.zIndex` | number | `9999` | Z-index del widget |

## 🎨 Personalización

### Temas Predefinidos

```javascript
// Tema WhatsApp (por defecto)
primaryColor: '#25D366'
secondaryColor: '#128C7E'

// Tema Azul
primaryColor: '#007bff'
secondaryColor: '#0056b3'

// Tema Rojo
primaryColor: '#dc3545'
secondaryColor: '#c82333'
```

### Posiciones Disponibles

- `bottom-right` (por defecto)
- `bottom-left`
- `top-right`
- `top-left`

## 📊 Eventos de Analítica

El widget rastrea automáticamente los siguientes eventos:

- `widget_initialized` - Widget inicializado
- `menu_opened` - Menú de canales abierto
- `menu_closed` - Menú de canales cerrado
- `channel_clicked` - Canal específico clickeado
- `message_sent` - Mensaje enviado en chat interno
- `websocket_connected` - WebSocket conectado
- `websocket_disconnected` - WebSocket desconectado
- `websocket_error` - Error en WebSocket

## 🔧 Desarrollo Local

1. Clona el repositorio:
```bash
git clone https://github.com/wazaut/messaging-widget.git
cd messaging-widget
```

2. Abre `index.html` en tu navegador o usa un servidor local:
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .

# Con PHP
php -S localhost:8000
```

3. Ve a `http://localhost:8000` para ver la demo.

## 🌐 Compatibilidad

### Navegadores Soportados

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Opera 47+

### Frameworks Compatibles

- ✅ Vanilla JavaScript
- ✅ React
- ✅ Vue.js
- ✅ Angular
- ✅ Svelte
- ✅ WordPress
- ✅ Drupal
- ✅ Joomla

## 🚀 Deployment

### CDN (Recomendado)

```html
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@1.0.1"></script>
```

### Self-Hosted

1. Descarga `messaging-widget.js`
2. Súbelo a tu servidor
3. Incluye el script:

```html
<script src="/path/to/messaging-widget.js"></script>
```

### Webpack/Bundle

```javascript
import MessagingWidget from './messaging-widget.js';

MessagingWidget.init({
  // tu configuración
});
```

## 🔐 Seguridad

- ✅ Estilos aislados con Shadow DOM
- ✅ No hay dependencias externas
- ✅ Sanitización automática de entradas
- ✅ CSP (Content Security Policy) compatible
- ✅ HTTPS requerido para WebSocket

## 📈 Performance

- 📦 **Tamaño**: ~15KB minificado + gzipped
- ⚡ **Carga**: Asíncrona, no bloquea el render
- 🔋 **Memoria**: <1MB de uso
- 📱 **Móvil**: Optimizado para dispositivos táctiles

## 🐛 Troubleshooting

### Problemas Comunes

**El widget no aparece:**
- Verifica que el script se carga correctamente
- Revisa la consola por errores JavaScript
- Asegúrate de llamar `MessagingWidget.init()`

**WhatsApp no abre:**
- Verifica el formato del número: `+1234567890`
- Asegúrate de incluir el código de país

**Chat interno no funciona:**
- Verifica la URL del WebSocket
- Comprueba la conexión a internet
- Revisa los logs de tu servidor WebSocket

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -am 'Añadir nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Crea un Pull Request

## 📞 Soporte

- 📧 Email: soporte@wazaut.com
- 📖 Docs: [Documentación completa](https://docs.wazaut.com)
- 🐛 Issues: [GitHub Issues](https://github.com/wazaut/messaging-widget/issues)

## 🏆 Créditos

Desarrollado con ❤️ por [Tu Nombre](https://github.com/wazaut)

### Iconos
- WhatsApp, Instagram, Messenger iconos por sus respectivos propietarios
- Iconos adicionales por [Material Design Icons](https://materialdesignicons.com/)

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
