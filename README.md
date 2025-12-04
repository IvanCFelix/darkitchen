# DarKitchen - Aplicación Mobile-First con Ionic, Firebase y Angular

Aplicación de marketplace de cocinas virtuales (darkitchens) donde usuarios pueden solicitar comida personalizada y cocinas pueden responder a solicitudes en tiempo real.

## 🚀 Stack Tecnológico

- **Frontend**: Ionic Framework + Angular 20
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, Storage)
- **Estado**: RxJS Observables
- **Arquitectura**: Clean Architecture + SOLID
- **Mobile**: Capacitor

## 📦 Instalación

### 1. Instalar dependencias del proyecto principal

```bash
npm install
```

### 2. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Copia las credenciales de configuración
3. Actualiza `src/environments/environment.ts` y `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_AUTH_DOMAIN',
    projectId: 'TU_PROJECT_ID',
    storageBucket: 'TU_STORAGE_BUCKET',
    messagingSenderId: 'TU_MESSAGING_SENDER_ID',
    appId: 'TU_APP_ID',
  },
};
```

### 3. Instalar dependencias de Cloud Functions

```bash
cd functions
npm install
cd ..
```

### 4. Desplegar Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Desplegar Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 🏃‍♂️ Ejecución

### Desarrollo Web

```bash
npm start
```

La aplicación se ejecutará en `http://localhost:4200/`

### Build de Producción

```bash
npm run build
```

### Capacitor (iOS/Android)

```bash
# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android

# Abrir en Xcode
npx cap open ios
```

## 📚 Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Modelos TypeScript tipados
│   │   ├── services/        # Servicios de negocio
│   │   └── guards/          # Guards de autenticación
│   ├── shared/
│   │   ├── components/      # Componentes reutilizables
│   │   └── animations/      # Animaciones Angular
│   ├── features/
│   │   ├── auth/            # Autenticación
│   │   ├── home/            # Página principal
│   │   ├── requests/        # Gestión de solicitudes
│   │   ├── orders/          # Seguimiento de pedidos
│   │   ├── darkitchen/      # Dashboard Darkitchen
│   │   └── profile/         # Perfil de usuario
│   └── theme/               # Estilos globales
├── environments/            # Configuración de entornos
functions/
├── src/
│   └── index.ts            # Cloud Functions
firestore-rules/
├── firestore.rules         # Reglas de seguridad
└── firestore.indexes.json  # Índices de Firestore
```

## 🎨 Diseño UI/UX

### Paleta de Colores

- **Blanco**: `#FFFFFF` - Fondo
- **Negro**: `#000000` - Textos principales
- **Dorado**: `#D4AF37` - Botones, highlights, badges

### Componentes Ionic Utilizados

- `ion-card`, `ion-list`, `ion-searchbar`
- `ion-segment`, `ion-tabs`, `ion-modal`
- `ion-toast`, `ion-progress-bar`, `ion-fab`

## 🔐 Autenticación

- Email/Password
- Google Sign-In

## 📊 Modelo de Datos

### Colecciones Firestore

1. **users** - Información de usuarios
2. **darkitchens** - Perfiles de cocinas virtuales
3. **dishes** - Platillos disponibles
4. **requests** - Solicitudes de clientes
5. **orders** - Pedidos activos
6. **orderStatusHistory** - Historial de estados

## ⚙️ Cloud Functions

1. **onRequestCreated** - Programa expiración de solicitudes (10 min)
2. **expireRequest** - Marca solicitudes como expiradas
3. **acceptRequest** - Acepta solicitud y crea pedido
4. **onOrderStatusUpdate** - Registra cambios de estado

## 🔒 Reglas de Seguridad

- Los usuarios solo pueden leer/escribir sus propios documentos
- Solo darkitchen owners pueden gestionar sus negocios
- Solo darkitchen owners pueden actualizar estados de pedidos
- Las solicitudes solo pueden ser aceptadas mediante Cloud Functions

## 📱 Flujos Principales

### Usuario

1. Crear solicitud con dirección y método de pago
2. Ver seguimiento del pedido en tiempo real
3. Recibir notificaciones de cambios de estado

### Darkitchen

1. Crear perfil de negocio
2. Publicar platillos
3. Buscar solicitudes abiertas
4. Aceptar solicitudes y crear pedidos
5. Actualizar estado del pedido

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start

# Build
npm run build

# Deploy Firebase
firebase deploy

# Deploy solo Functions
firebase deploy --only functions

# Deploy solo Rules
firebase deploy --only firestore:rules
```

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Desarrollo

Desarrollado siguiendo principios de Clean Architecture, SOLID y Mobile-First Design.
