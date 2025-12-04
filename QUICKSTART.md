# ⚠️ CONFIGURACIÓN IMPORTANTE - LEE ESTO PRIMERO

## 🔥 Configurar Firebase (PASO OBLIGATORIO)

### 1. Actualizar credenciales de Firebase

**Archivo:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'TU_API_KEY_AQUI', // ← REEMPLAZAR
    authDomain: 'TU_PROJECT.firebaseapp.com', // ← REEMPLAZAR
    projectId: 'TU_PROJECT_ID', // ← REEMPLAZAR
    storageBucket: 'TU_PROJECT.appspot.com', // ← REEMPLAZAR
    messagingSenderId: 'TU_SENDER_ID', // ← REEMPLAZAR
    appId: 'TU_APP_ID', // ← REEMPLAZAR
  },
};
```

**Archivo:** `src/environments/environment.prod.ts` (copiar lo mismo pero con `production: true`)

### 2. Cómo obtener las credenciales

1. Ir a https://console.firebase.google.com/
2. Crear un nuevo proyecto o seleccionar uno existente
3. Click en el ícono de engranaje ⚙️ → "Project settings"
4. Scroll hacia abajo en "General"
5. En "Your apps", click en el botón `</>` (Web)
6. Registrar la app (nombre: "DarKitchen")
7. Copiar el objeto `firebaseConfig` que aparece
8. Pegar los valores en `environment.ts` y `environment.prod.ts`

---

## 🚀 Ejecutar la Aplicación

Una vez configurado Firebase:

```bash
# Iniciar servidor de desarrollo
npm start
```

Abrir navegador en: http://localhost:4200/

---

## ⚡ Notas de Compatibilidad

- ✅ **Angular 20** + **@angular/fire 19**: Funciona con `--legacy-peer-deps`
- ✅ Ya configurado en `.npmrc` para futuros `npm install`
- ⚠️ Firebase requiere actualizar a versión compatible con Angular 20 cuando esté disponible

---

## 📋 Próximos Pasos Después de Configurar Firebase

1. **Habilitar Authentication en Firebase Console:**

   - Authentication → Sign-in method
   - Habilitar "Email/Password"
   - (Opcional) Habilitar "Google"

2. **Crear Firestore Database:**

   - Firestore Database → Create database
   - Modo: Production (las reglas se desplegarán después)
   - Ubicación: us-central1 (o la más cercana)

3. **Desplegar Firestore Rules:**

   ```bash
   firebase login
   firebase use --add  # Seleccionar tu proyecto
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

4. **Desplegar Cloud Functions:**
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions
   ```

---

## ❓ Troubleshooting

### Error: "Firebase config is not defined"

→ Configurar `src/environments/environment.ts` con credenciales reales

### Error: "Permission denied" en Firestore

→ Desplegar rules: `firebase deploy --only firestore:rules`

### Error al instalar dependencias

→ Usar: `npm install --legacy-peer-deps`

---

## 📞 Soporte

Ver archivos de documentación completa:

- `README.md` - Overview del proyecto
- `INSTALL.md` - Guía de instalación paso a paso
- `ARCHITECTURE.md` - Documentación técnica completa
