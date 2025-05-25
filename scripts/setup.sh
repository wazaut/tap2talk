#!/bin/bash

# 🔧 Script de Setup de Desarrollo
# Configura el entorno de desarrollo completo

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[SETUP]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo ""
echo "🔧 SETUP DE DESARROLLO - Messaging Widget"
echo "==========================================="
echo ""

# Verificar Node.js
log "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Instala desde: https://nodejs.org/"
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="16.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" 2>/dev/null; then
    error "Node.js $REQUIRED_VERSION o superior requerido. Actual: $NODE_VERSION"
fi

success "Node.js $NODE_VERSION verificado"

# Verificar npm
log "Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi

NPM_VERSION=$(npm --version)
success "npm $NPM_VERSION verificado"

# Instalar dependencias
log "Instalando dependencias..."
npm install
success "Dependencias instaladas"

# Hacer scripts ejecutables
log "Configurando permisos de scripts..."
chmod +x scripts/*.sh
success "Scripts configurados"

# Crear directorios necesarios
log "Creando directorios..."
mkdir -p dist/
mkdir -p tests/
success "Directorios creados"

# Configurar Git hooks (opcional)
if [ -d ".git" ]; then
    log "Configurando Git hooks..."
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook para Messaging Widget

echo "🔍 Ejecutando validaciones pre-commit..."

# Linting
echo "📝 Verificando código..."
npm run lint || exit 1

# Tests (si existen)
if [ -d "tests" ] && [ "$(ls -A tests)" ]; then
    echo "🧪 Ejecutando tests..."
    npm run test || exit 1
fi

echo "✅ Validaciones completadas"
EOF
    
    chmod +x .git/hooks/pre-commit
    success "Git hooks configurados"
fi

# Verificar configuración
log "Verificando configuración..."

# Test de build básico
npm run build:dev > /dev/null 2>&1
if [ -f "dist/messaging-widget.js" ]; then
    success "Build de desarrollo funciona"
else
    warning "Problemas con build de desarrollo"
fi

# Limpiar build de test
rm -rf dist/

# Mostrar comandos disponibles
echo ""
echo "📋 COMANDOS DISPONIBLES:"
echo "========================"
echo ""
echo "🔨 Desarrollo:"
echo "  npm run dev          - Servidor de desarrollo con hot reload"
echo "  npm run build        - Build completo (dev + prod)"
echo "  npm run build:dev    - Solo build de desarrollo"
echo "  npm run build:prod   - Solo build de producción"
echo ""
echo "🧪 Testing:"
echo "  npm run test         - Ejecutar tests"
echo "  npm run test:watch   - Tests en modo watch"
echo "  npm run lint         - Verificar código"
echo "  npm run lint:fix     - Corregir problemas de linting"
echo ""
echo "📦 Deploy:"
echo "  npm run serve        - Servir archivos compilados"
echo "  npm run size         - Verificar tamaños de bundle"
echo "  npm run analyze      - Analizar bundle"
echo "  ./scripts/build.sh   - Build completo con validaciones"
echo "  ./scripts/deploy.sh  - Deploy automático"
echo ""
echo "🔧 Utilidades:"
echo "  npm run clean        - Limpiar archivos compilados"
echo "  npm run format       - Formatear código"
echo "  npm run validate     - Validación completa"
echo ""

# Información del proyecto
PACKAGE_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

echo "📊 INFORMACIÓN DEL PROYECTO:"
echo "============================="
echo "Nombre: $PACKAGE_NAME"
echo "Versión: $PACKAGE_VERSION"
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"
echo ""

# Sugerencias
echo "💡 PRÓXIMOS PASOS:"
echo "=================="
echo "1. Ejecuta: npm run dev"
echo "2. Abre: http://localhost:8080"
echo "3. Edita archivos en src/ y css/"
echo "4. Ve cambios en tiempo real"
echo ""
echo "📖 Para más información:"
echo "  - README.md - Documentación principal"
echo "  - DEPLOYMENT.md - Guía de despliegue"
echo "  - examples/ - Ejemplos de uso"
echo ""

success "¡Setup completado! Listo para desarrollar 🚀"

# Preguntar si quiere ejecutar dev server
echo ""
read -p "¿Quieres iniciar el servidor de desarrollo ahora? (y/n): " START_DEV

if [ "$START_DEV" = "y" ] || [ "$START_DEV" = "Y" ] || [ "$START_DEV" = "yes" ]; then
    log "Iniciando servidor de desarrollo..."
    npm run dev
fi
