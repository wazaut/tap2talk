#!/bin/bash

# 🚀 Script de Build Completo para Messaging Widget
# Este script automatiza todo el proceso de compilación y validación

set -e  # Exit on any error

echo "🚀 Iniciando build completo del Messaging Widget..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar prerrequisitos
log "Verificando prerrequisitos..."

if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
fi

if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
NPM_VERSION=$(npm --version)

log "Node.js version: $NODE_VERSION"
log "npm version: $NPM_VERSION"

# Verificar version mínima de Node.js
REQUIRED_NODE="16.0.0"
if ! npm list -g semver &> /dev/null; then
    npm install -g semver &> /dev/null
fi

if ! npx semver -r ">=$REQUIRED_NODE" "$NODE_VERSION" &> /dev/null; then
    error "Node.js $REQUIRED_NODE o superior requerido. Actual: $NODE_VERSION"
fi

success "Prerrequisitos verificados"

# Limpiar instalación anterior
log "Limpiando archivos anteriores..."
rm -rf dist/
rm -rf node_modules/.cache/
success "Limpieza completada"

# Instalar dependencias
log "Instalando dependencias..."
npm ci
success "Dependencias instaladas"

# Linting
log "Ejecutando linting..."
npm run lint
success "Linting completado"

# Tests (si existen)
if [ -d "tests" ]; then
    log "Ejecutando tests..."
    npm run test
    success "Tests completados"
else
    warning "No se encontraron tests"
fi

# Build de desarrollo
log "Compilando versión de desarrollo..."
npm run build:dev
success "Build de desarrollo completado"

# Build de producción
log "Compilando versión de producción..."
npm run build:prod
success "Build de producción completado"

# Build CSS
log "Compilando CSS..."
npm run build:css
success "CSS compilado"

# Copiar assets
log "Copiando assets..."
npm run copy-assets
success "Assets copiados"

# Verificar tamaños
log "Verificando tamaños de bundle..."
if npm run size; then
    success "Tamaños dentro de los límites"
else
    warning "Revisar tamaños de bundle"
fi

# Generar estadísticas
log "Generando estadísticas..."
MAIN_JS_SIZE=$(du -h dist/messaging-widget.min.js | cut -f1)
MAIN_CSS_SIZE=$(du -h dist/messaging-widget.min.css | cut -f1)
GZIP_JS_SIZE=$(gzip -c dist/messaging-widget.min.js | wc -c | awk '{print int($1/1024)"KB"}')
GZIP_CSS_SIZE=$(gzip -c dist/messaging-widget.min.css | wc -c | awk '{print int($1/1024)"KB"}')

echo ""
echo "📊 ESTADÍSTICAS DEL BUILD:"
echo "=========================="
echo "JavaScript (min):     $MAIN_JS_SIZE"
echo "JavaScript (gzipped): $GZIP_JS_SIZE"
echo "CSS (min):           $MAIN_CSS_SIZE"
echo "CSS (gzipped):       $GZIP_CSS_SIZE"
echo ""

# Listar archivos generados
echo "📁 ARCHIVOS GENERADOS:"
echo "====================="
ls -la dist/
echo ""

# Validación final
log "Ejecutando validación final..."

# Verificar que archivos existen
REQUIRED_FILES=("messaging-widget.min.js" "messaging-widget.js" "messaging-widget.min.css" "messaging-widget.css")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "dist/$file" ]; then
        success "$file generado correctamente"
    else
        error "$file no fue generado"
    fi
done

# Test de carga básico
log "Probando carga del widget..."
if node -e "require('./dist/messaging-widget.js')" 2>/dev/null; then
    success "Widget se carga correctamente"
else
    warning "Posible problema con la carga del widget"
fi

# Generar hash para integridad
log "Generando hashes de integridad..."
echo "# Hashes de Integridad" > dist/INTEGRITY.md
echo "" >> dist/INTEGRITY.md
echo "## SHA256" >> dist/INTEGRITY.md
for file in dist/*.js dist/*.css; do
    if [ -f "$file" ]; then
        hash=$(shasum -a 256 "$file" | cut -d' ' -f1)
        filename=$(basename "$file")
        echo "- $filename: \`$hash\`" >> dist/INTEGRITY.md
    fi
done
success "Hashes generados"

# Build completado
echo ""
echo "🎉 BUILD COMPLETADO EXITOSAMENTE"
echo "================================"
echo ""
echo "📦 Los archivos están listos en ./dist/"
echo "🌐 Para probar: npm run serve"
echo "📤 Para deploy: usar archivos en ./dist/"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Probar la demo: npm run serve"
echo "  2. Revisar archivos en ./dist/"
echo "  3. Subir a CDN o distribuir según necesidad"
echo ""

success "¡Todo listo para distribución! 🚀"
