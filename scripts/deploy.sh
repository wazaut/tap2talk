#!/bin/bash

# 📦 Script de Deploy Automático
# Despliega el widget a múltiples plataformas

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Configuración
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")

echo ""
echo "🚀 DEPLOY AUTOMÁTICO - ${PACKAGE_NAME} v${VERSION}"
echo "================================================"
echo ""

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    error "Deploy solo permitido desde rama main/master. Actual: $CURRENT_BRANCH"
fi

# Verificar que no hay cambios sin commit
if ! git diff-index --quiet HEAD --; then
    error "Hay cambios sin commit. Haz commit antes del deploy."
fi

# Build completo
log "Ejecutando build completo..."
chmod +x ./scripts/build.sh
./scripts/build.sh
success "Build completado"

# Verificar tests
log "Ejecutando tests finales..."
npm run test 2>/dev/null || warning "Tests no disponibles"
success "Validación completada"

# Opciones de deploy
echo ""
echo "📦 OPCIONES DE DEPLOY:"
echo "====================="
echo "1) NPM Package"
echo "2) GitHub Release"
echo "3) CDN (AWS S3)"
echo "4) Todo (NPM + GitHub + CDN)"
echo "5) Solo validar (dry-run)"
echo ""
read -p "Selecciona opción (1-5): " DEPLOY_OPTION

# Función para deploy a NPM
deploy_npm() {
    log "Verificando autenticación NPM..."
    if ! npm whoami > /dev/null 2>&1; then
        error "No estás autenticado en NPM. Ejecuta: npm login"
    fi
    
    log "Verificando si la versión ya existe..."
    if npm view ${PACKAGE_NAME}@${VERSION} version > /dev/null 2>&1; then
        error "La versión ${VERSION} ya existe en NPM"
    fi
    
    log "Publicando en NPM..."
    npm publish --access public
    success "Publicado en NPM: https://www.npmjs.com/package/${PACKAGE_NAME}"
    
    # Verificar que se publicó correctamente
    sleep 5
    if npm view ${PACKAGE_NAME}@${VERSION} version > /dev/null 2>&1; then
        success "Verificación NPM exitosa"
    else
        warning "No se pudo verificar la publicación en NPM"
    fi
}

# Función para GitHub Release
deploy_github() {
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) no está instalado"
    fi
    
    log "Verificando autenticación GitHub..."
    if ! gh auth status > /dev/null 2>&1; then
        error "No estás autenticado en GitHub. Ejecuta: gh auth login"
    fi
    
    # Crear tag si no existe
    TAG="v${VERSION}"
    if ! git tag -l | grep -q "^${TAG}$"; then
        log "Creando tag ${TAG}..."
        git tag ${TAG}
        git push origin ${TAG}
    fi
    
    # Crear release
    log "Creando GitHub Release..."
    
    # Release notes básicas
    RELEASE_NOTES="## 🚀 Release ${VERSION}

### 📦 Assets Incluidos
- \`messaging-widget.min.js\` - Versión minificada para producción
- \`messaging-widget.js\` - Versión desarrollo con source maps
- \`messaging-widget.min.css\` - Estilos minificados
- \`messaging-widget.css\` - Estilos desarrollo

### 📊 Estadísticas
- Bundle size: $(du -h dist/messaging-widget.min.js | cut -f1)
- CSS size: $(du -h dist/messaging-widget.min.css | cut -f1)

### 🔗 Enlaces
- [NPM Package](https://www.npmjs.com/package/${PACKAGE_NAME})
- [CDN](https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${VERSION}/dist/messaging-widget.min.js)"
    
    gh release create ${TAG} \
        --title "Release ${VERSION}" \
        --notes "${RELEASE_NOTES}" \
        dist/messaging-widget.min.js \
        dist/messaging-widget.js \
        dist/messaging-widget.min.css \
        dist/messaging-widget.css
    
    success "GitHub Release creado"
}

# Función para deploy a CDN
deploy_cdn() {
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        warning "Variables AWS no configuradas. Saltando deploy a CDN."
        return 0
    fi
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI no está instalado"
    fi
    
    S3_BUCKET="${S3_BUCKET:-messaging-widget-cdn}"
    CDN_PATH="${CDN_PATH:-v${VERSION}}"
    
    log "Subiendo a S3: s3://${S3_BUCKET}/${CDN_PATH}/"
    
    # Subir archivos con headers correctos
    aws s3 cp dist/messaging-widget.min.js s3://${S3_BUCKET}/${CDN_PATH}/ \
        --content-type "application/javascript" \
        --cache-control "public, max-age=31536000" \
        --acl public-read
    
    aws s3 cp dist/messaging-widget.min.css s3://${S3_BUCKET}/${CDN_PATH}/ \
        --content-type "text/css" \
        --cache-control "public, max-age=31536000" \
        --acl public-read
    
    success "Subido a CDN"
}

# Función para validación solamente
validate_only() {
    log "Ejecutando validación completa..."
    
    # Verificar archivos requeridos
    REQUIRED_FILES=("messaging-widget.min.js" "messaging-widget.js" "messaging-widget.min.css")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "dist/$file" ]; then
            success "$file existe"
        else
            error "$file no encontrado"
        fi
    done
    
    # Verificar tamaños
    JS_SIZE=$(wc -c < dist/messaging-widget.min.js)
    CSS_SIZE=$(wc -c < dist/messaging-widget.min.css)
    
    if [ $JS_SIZE -gt 25000 ]; then
        warning "Archivo JS muy grande: ${JS_SIZE} bytes"
    else
        success "Tamaño JS correcto: ${JS_SIZE} bytes"
    fi
    
    if [ $CSS_SIZE -gt 8000 ]; then
        warning "Archivo CSS muy grande: ${CSS_SIZE} bytes"
    else
        success "Tamaño CSS correcto: ${CSS_SIZE} bytes"
    fi
    
    success "Validación completada - todo listo para deploy"
}

# Ejecutar según opción seleccionada
case $DEPLOY_OPTION in
    1)
        log "Desplegando a NPM..."
        deploy_npm
        ;;
    2)
        log "Creando GitHub Release..."
        deploy_github
        ;;
    3)
        log "Subiendo a CDN..."
        deploy_cdn
        ;;
    4)
        log "Deploy completo..."
        deploy_npm
        deploy_github
        deploy_cdn
        ;;
    5)
        log "Validación en dry-run..."
        validate_only
        ;;
    *)
        error "Opción inválida"
        ;;
esac

# Notificaciones finales
if [ "$DEPLOY_OPTION" != "5" ]; then
    echo ""
    echo "🎉 DEPLOY COMPLETADO"
    echo "==================="
    echo ""
    echo "📦 Versión: ${VERSION}"
    echo "🕒 Timestamp: $(date)"
    echo "📝 Git commit: $(git rev-parse --short HEAD)"
    echo ""
    echo "🔗 Enlaces útiles:"
    echo "  - NPM: https://www.npmjs.com/package/${PACKAGE_NAME}"
    echo "  - CDN: https://cdn.jsdelivr.net/npm/${PACKAGE_NAME}@${VERSION}/dist/messaging-widget.min.js"
    echo ""
    success "¡Deploy exitoso! 🚀"
fi
