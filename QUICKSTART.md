# 🚀 Guía de Inicio Rápido

¡Bienvenido al Messaging Widget! Esta guía te ayudará a tener todo funcionando en menos de 5 minutos.

## ⚡ Setup Ultra-Rápido

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/messaging-widget.git
cd messaging-widget

# 2. Setup automático
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. ¡Listo! El servidor se abrirá automáticamente
```

## 🛠️ Comandos Esenciales

```bash
# Desarrollo
npm run dev          # 🔥 Hot reload en http://localhost:8080

# Build
npm run build        # 📦 Compilar todo
./scripts/build.sh   # 🔧 Build completo con validaciones

# Deploy
./scripts/deploy.sh  # 🚀 Deploy automático a NPM/GitHub/CDN
```

## 📁 Estructura Rápida

```
messaging-widget/
├── src/                 # 📝 Código fuente
├── css/                 # 🎨 Estilos
├── dist/                # 📦 Archivos compilados
├── examples/            # 📋 Ejemplos de uso
├── scripts/             # 🔧 Scripts de automatización
└── docs/                # 📖 Documentación
```

## 🎯 Uso Básico

### Integración Simple
```html
<script src="dist/messaging-widget.min.js"></script>
<script>
  MessagingWidget.init({
    channels: {
      whatsapp: { enabled: true, number: '+1234567890' }
    }
  });
</script>
```

### Con Data Attributes
```html
<script 
  src="dist/messaging-widget.min.js"
  data-messaging-widget
  data-whatsapp="+1234567890"
  data-instagram="tu_usuario"
  data-primary-color="#25D366">
</script>
```

## 🔧 Desarrollo

### Estructura de Archivos
- **`src/messaging-widget.js`** - Código principal del widget
- **`css/messaging-widget.css`** - Estilos base
- **`webpack.config.js`** - Configuración de build
- **`package.json`** - Scripts y dependencias

### Workflow de Desarrollo
1. **Editar**: Modifica archivos en `src/` y `css/`
2. **Probar**: `npm run dev` para hot reload
3. **Validar**: `npm run lint` y `npm run test`
4. **Compilar**: `npm run build`
5. **Deploy**: `./scripts/deploy.sh`

## 📦 Build y Distribución

### Build Local
```bash
# Build completo con validaciones
./scripts/build.sh

# Solo compilar
npm run build

# Verificar tamaños
npm run size
```

### Deploy Automático
```bash
# Deploy completo (NPM + GitHub + CDN)
./scripts/deploy.sh

# Opciones disponibles:
# 1) Solo NPM
# 2) Solo GitHub Release
# 3) Solo CDN
# 4) Todo
# 5) Validar solamente
```

## 🌐 Distribución

### CDN (Recomendado)
```html
<!-- Última versión -->
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@latest/dist/messaging-widget.min.js"></script>

<!-- Versión específica -->
<script src="https://cdn.jsdelivr.net/npm/messaging-widget@1.0.0/dist/messaging-widget.min.js"></script>
```

### NPM Package
```bash
npm install messaging-widget
```

```javascript
import MessagingWidget from 'messaging-widget';
MessagingWidget.init({ /* config */ });
```

### Self-Hosted
```bash
# Descargar desde GitHub Releases
curl -L https://github.com/tu-usuario/messaging-widget/releases/download/v1.0.0/messaging-widget.min.js -o messaging-widget.min.js
```

## 🔍 Troubleshooting

### Problemas Comunes

**Error: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build falla**
```bash
# Verificar Node.js version
node --version  # Debe ser v16+

# Limpiar y rebuilding
npm run clean
npm run build
```

**Widget no aparece**
- Verificar que el script se carga sin errores
- Revisar console del navegador
- Asegurar que `MessagingWidget.init()` se ejecuta

## 📚 Recursos

- **📖 [README.md](README.md)** - Documentación completa
- **🚀 [DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de despliegue
- **📝 [CHANGELOG.md](CHANGELOG.md)** - Historial de cambios
- **💻 [examples/](examples/)** - Ejemplos prácticos
- **🔧 [scripts/](scripts/)** - Scripts de automatización

## 🆘 Soporte

- **🐛 Issues**: [GitHub Issues](https://github.com/tu-usuario/messaging-widget/issues)
- **💬 Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/messaging-widget/discussions)
- **📧 Email**: soporte@tudominio.com

## ✅ Checklist de Setup

- [ ] ✅ Node.js v16+ instalado
- [ ] ✅ Repositorio clonado
- [ ] ✅ `./scripts/setup.sh` ejecutado
- [ ] ✅ `npm run dev` funciona
- [ ] ✅ http://localhost:8080 abre correctamente
- [ ] ✅ Widget aparece en la esquina
- [ ] ✅ Canales configurados

---

🎉 **¡Ya estás listo para desarrollar!** 

Para configuración avanzada, consulta [DEPLOYMENT.md](DEPLOYMENT.md).
