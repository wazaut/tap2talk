# 🚀 Guía de Compilación, Empaquetado y Distribución

## 📋 Prerrequisitos

### Sistema Requerido
- **Node.js**: v16.0.0 o superior
- **npm**: v7.0.0 o superior (o yarn v1.22.0+)
- **Git**: Para control de versiones

```bash
# Verificar versiones
node --version  # v16.0.0+
npm --version   # v7.0.0+
git --version   # cualquier versión reciente
```

## 🛠️ Configuración Inicial

### 1. Clonar y Configurar Proyecto

```bash
# Clonar repositorio
git clone https://github.com/wazaut/tap2talk.git
cd messaging-widget

# Instalar dependencias
npm install

# Verificar instalación
npm run validate
```

### 2. Estructura del Proyecto

```
messaging-widget/
├── src/                    # Código fuente
│   └── messaging-widget.js
├── css/                    # Estilos fuente
│   └── messaging-widget.css
├── dist/                   # Archivos compilados (generado)
├── examples/               # Ejemplos de uso
├── tests/                  # Tests unitarios
├── .github/               # GitHub Actions
├── package.json           # Configuración npm
├── webpack.config.js      # Configuración Webpack
├── postcss.config.js      # Configuración PostCSS
├── .eslintrc.js          # Configuración ESLint
└── .prettierrc           # Configuración Prettier
```

## 🔨 Proceso de Compilación

### Comandos Principales

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilación completa
npm run build

# Solo JavaScript
npm run build:js

# Solo CSS
npm run build:css

# Limpiar dist/
npm run clean

# Servir archivos compilados
npm run serve
```

### Compilación Paso a Paso

#### 1. Desarrollo Local
```bash
# Inicia servidor de desarrollo
npm run dev

# Se abre automáticamente en http://localhost:8080
# Hot reload activado para cambios en tiempo real
```

#### 2. Compilación de Producción
```bash
# Compilación completa optimizada
npm run build

# Archivos generados en dist/:
# ├── messaging-widget.js      (desarrollo)
# ├── messaging-widget.min.js  (producción)
# ├── messaging-widget.css     (desarrollo)
# ├── messaging-widget.min.css (producción)
# ├── messaging-widget.js.map  (source map)
# └── index.html              (demo)
```

#### 3. Optimizaciones Aplicadas
- **JavaScript**: Minificación, tree shaking, babel transpilation
- **CSS**: Autoprefixer, minificación, purge CSS no usado
- **Assets**: Compresión, optimización de imágenes
- **Gzip**: Compresión adicional para CDN

## 📦 Empaquetado

### Versiones Generadas

```bash
npm run build
```

**Archivos de distribución:**

1. **`messaging-widget.js`** (33KB)
   - Versión desarrollo con comentarios
   - Source maps incluidos
   - Logs de debugging

2. **`messaging-widget.min.js`** (15KB)
   - Versión producción minificada
   - Sin comentarios ni logs
   - Optimizada para performance

3. **`messaging-widget.css`** (8KB)
   - Estilos completos para fallback
   - Comentarios incluidos

4. **`messaging-widget.min.css`** (3KB)
   - Versión minificada
   - Autoprefixer aplicado

### Validación de Tamaños

```bash
# Verificar tamaños límite
npm run size

# Analizar bundle
npm run analyze
```

**Límites configurados:**
- JavaScript: < 20KB (gzipped)
- CSS: < 5KB (gzipped)

## 🚀 Opciones de Distribución

### 1. CDN (Recomendado)

#### A. jsDelivr (Gratuito)
```html
<!-- Última versión -->
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@latest/dist/messaging-widget.min.js"></script>

<!-- Versión específica -->
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@1.0.0/dist/messaging-widget.min.js"></script>
```

#### B. unpkg (Gratuito)
```html
<script src="https://unpkg.com/messaging-widget@latest/dist/messaging-widget.min.js"></script>
```

#### C. CDN Personalizado
```bash
# Subir a tu CDN
aws s3 sync dist/ s3://tu-bucket/messaging-widget/v1.0.0/ --acl public-read

# URL resultante
https://cdn.tudominio.com/messaging-widget/v1.0.0/messaging-widget.min.js
```

### 2. NPM Package

#### Preparar para Publicación
```bash
# Verificar que todo esté listo
npm run validate
npm run build

# Simular publicación
npm pack

# Verificar contenido del package
tar -tzf messaging-widget-1.0.0.tgz
```

#### Publicar a NPM
```bash
# Primer release
npm login
npm publish

# Actualizaciones
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Publish automático configurado en postversion
```

#### Uso desde NPM
```bash
# Instalar
npm install messaging-widget

# En tu proyecto
import MessagingWidget from 'messaging-widget';
MessagingWidget.init({...});
```

### 3. GitHub Releases

#### Crear Release Automático
```bash
# Crear tag y release
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions creará automáticamente:
# - Release con archivos compilados
# - Changelog automático
# - Assets descargables
```

#### Assets Incluidos en Release
- `messaging-widget.min.js`
- `messaging-widget.min.css`
- `messaging-widget-v1.0.0.zip` (completo)
- Source maps

### 4. Self-Hosted

#### Opción A: Descarga Directa
```bash
# Desde GitHub Releases
curl -L https://github.com/wazaut/tap2talk/releases/download/v1.0.0/messaging-widget.min.js -o messaging-widget.min.js
```

#### Opción B: Git Submodule
```bash
# En tu proyecto
git submodule add https://github.com/wazaut/tap2talk.git vendor/messaging-widget

# Usar archivo compilado
<script src="vendor/messaging-widget/dist/messaging-widget.min.js"></script>
```

## 🔄 CI/CD Automatización

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test
    
    - name: Check bundle size
      run: npm run size

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18.x
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist-files
        path: dist/

  deploy:
    if: github.event_name == 'release'
    needs: [test, build]
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18.x
        cache: 'npm'
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Publish to NPM
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    
    - name: Upload Release Assets
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ github.event.release.upload_url }}
        asset_path: ./dist/messaging-widget.min.js
        asset_name: messaging-widget.min.js
        asset_content_type: application/javascript
```

## 📊 Monitoreo y Métricas

### Bundle Analysis
```bash
# Analizar tamaño del bundle
npm run analyze

# Métricas importantes:
# - Tamaño total: <20KB
# - Dependencias: 0 externas
# - Tree shaking: efectivo
# - Compresión: >70%
```

### Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Métricas objetivo:
# - Performance: >90
# - Best Practices: >95
# - Accessibility: >90
```

## 🌐 Distribución Multi-Plataforma

### 1. Web (Principal)
```html
<!-- CDN -->
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@1.0.0/dist/messaging-widget.min.js"></script>

<!-- Self-hosted -->
<script src="/assets/js/messaging-widget.min.js"></script>
```

### 2. NPM Module
```javascript
// ES6 Modules
import MessagingWidget from 'messaging-widget';

// CommonJS
const MessagingWidget = require('messaging-widget');

// AMD
define(['messaging-widget'], function(MessagingWidget) {
  // ...
});
```

### 3. WordPress Plugin
```php
// Crear plugin wrapper
<?php
/**
 * Plugin Name: Messaging Widget
 * Version: 1.0.0
 */

function messaging_widget_enqueue_scripts() {
    wp_enqueue_script(
        'messaging-widget',
        plugin_dir_url(__FILE__) . 'assets/messaging-widget.min.js',
        [],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'messaging_widget_enqueue_scripts');
```

### 4. Shopify App
```liquid
<!-- theme.liquid -->
{{ 'messaging-widget.min.js' | asset_url | script_tag }}

<script>
  MessagingWidget.init({
    channels: {
      whatsapp: { 
        enabled: true, 
        number: '{{ shop.phone }}' 
      }
    }
  });
</script>
```

## 🔧 Versionado y Updates

### Semantic Versioning
```bash
# Patch: Bug fixes (1.0.0 -> 1.0.1)
npm version patch

# Minor: New features (1.0.0 -> 1.1.0)
npm version minor

# Major: Breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### Changelog Automático
```bash
# Generar CHANGELOG.md
npm install -g conventional-changelog-cli
conventional-changelog -p angular -i CHANGELOG.md -s

# Commits seguir formato:
# feat: add new channel support
# fix: resolve mobile responsive issue
# docs: update installation guide
```

### Migration Guide
```markdown
# Migración v1.x -> v2.x

## Breaking Changes
- `init()` ahora requiere configuración mínima
- `channels.sms` removido, usar `channels.whatsapp`

## Código Anterior (v1.x)
MessagingWidget.init();

## Código Nuevo (v2.x)
MessagingWidget.init({
  channels: { whatsapp: { enabled: true } }
});
```

## 📈 Distribución y Analytics

### CDN Analytics
```javascript
// Tracking de uso
fetch('https://analytics.tap2talk.chat/track', {
  method: 'POST',
  body: JSON.stringify({
    widget: 'messaging-widget',
    version: '1.0.0',
    domain: window.location.hostname,
    timestamp: Date.now()
  })
});
```

### NPM Download Stats
```bash
# Ver estadísticas
npm info messaging-widget
npm view messaging-widget downloads

# Usar npm-stat para métricas detalladas
npx npm-stat messaging-widget
```

## 🛡️ Seguridad y Compliance

### Security Scanning
```bash
# Audit de dependencias
npm audit
npm audit fix

# Security scanning con Snyk
npx snyk test
npx snyk monitor
```

### GDPR Compliance
```javascript
// Configuración privacy-friendly
MessagingWidget.init({
  analytics: {
    enabled: false, // Desactivar por defecto
    requireConsent: true,
    anonymizeIPs: true
  },
  privacy: {
    showPrivacyNotice: true,
    privacyPolicyUrl: '/privacy'
  }
});
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Build Errors
```bash
# Error: Module not found
rm -rf node_modules package-lock.json
npm install

# Error: Out of memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### CDN Issues
```bash
# Verificar disponibilidad
curl -I https://cdn.jsdelivr.net/npm/messaging-widget@1.0.0/dist/messaging-widget.min.js

# Response esperado: 200 OK
```

#### Size Limits
```bash
# Si excede límites
npm run analyze
# Revisar dependencias innecesarias
# Optimizar imports
# Dividir en chunks si es necesario
```

### Support Channels
- 📧 **Email**: support@tap2talk.chat
- 💬 **Discord**: [Link al servidor]
- 📖 **Docs**: https://docs.tap2talk.chat
- 🐛 **Issues**: https://github.com/wazaut/tap2talk/issues

---

¡Con esta guía tienes todo lo necesario para compilar, empaquetar y distribuir el widget de manera profesional! 🚀
