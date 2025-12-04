# 🌱 Scripts de Seed para DarKitchen

Este directorio contiene scripts para poblar la base de datos de Firebase con datos de ejemplo.

## 📋 Prerrequisitos

1. Tener un proyecto de Firebase configurado
2. Haber creado al menos un Darkitchen en la aplicación
3. Node.js instalado

## 🚀 Cómo usar el script de platillos

### 1. Instalar dependencias

```bash
npm install firebase
```

### 2. Configurar Firebase

Edita el archivo `seed-dishes.ts` y reemplaza la configuración de Firebase:

```typescript
const firebaseConfig = {
  apiKey: 'TU_API_KEY', // ← De Firebase Console
  authDomain: 'TU_PROJECT.firebaseapp.com',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_PROJECT.appspot.com',
  messagingSenderId: 'TU_SENDER_ID',
  appId: 'TU_APP_ID',
};
```

### 3. Obtener el ID de tu Darkitchen

Opción A - Desde Firebase Console:

1. Ve a Firestore Database
2. Abre la colección `darkitchens`
3. Copia el ID del documento de tu darkitchen

Opción B - Desde la app:

1. Inicia sesión
2. Ve a la página de Dashboard de tu darkitchen
3. El ID estará en la URL o en la consola del navegador

### 4. Reemplazar el darkitchenId

En `seed-dishes.ts`, busca y reemplaza todas las ocurrencias de:

```typescript
darkitchenId: 'DARKITCHEN_ID_AQUI';
```

Con el ID real de tu darkitchen:

```typescript
darkitchenId: 'abc123xyz456'; // Tu ID real
```

### 5. Ejecutar el script

**Usando ts-node (recomendado):**

```bash
npx ts-node scripts/seed-dishes.ts
```

**O compilar primero:**

```bash
npx tsc scripts/seed-dishes.ts
node scripts/seed-dishes.js
```

## 📦 Platillos que se crearán

El script creará 10 platillos de ejemplo:

1. 🍕 Pizza Margarita - $150
2. 🍔 Hamburguesa Clásica - $120
3. 🌮 Tacos al Pastor - $85
4. 🍱 Sushi Roll California - $180
5. 🍝 Pasta Carbonara - $140
6. 🥗 Ensalada César - $95
7. 🌯 Burrito de Carne Asada - $110
8. 🍗 Pollo Teriyaki - $135
9. 🍗 Alitas BBQ - $125
10. 🍰 Cheesecake de Fresa - $75

Cada platillo incluye:

- Nombre y descripción
- Precio
- Categoría
- Imagen de ejemplo (URLs de Unsplash)
- Tiempo de preparación
- Opciones y extras
- Tags de búsqueda
- Rating y número de reseñas

## 🎨 Personalización

Puedes modificar los platillos en el array `sampleDishes`:

```typescript
{
  darkitchenId: 'TU_DARKITCHEN_ID',
  name: 'Nombre del platillo',
  description: 'Descripción detallada',
  price: 100,
  category: 'Categoría',
  images: ['URL_de_imagen'],
  available: true,
  preparationTime: 15,
  options: {
    sizes: ['Chico', 'Mediano', 'Grande'],
    extras: ['Extra 1', 'Extra 2']
  },
  tags: ['tag1', 'tag2'],
  rating: 4.5,
  reviewCount: 10,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

## ⚠️ Notas Importantes

- **Las imágenes son de ejemplo** de Unsplash. En producción deberías usar tus propias imágenes y subirlas a Firebase Storage.
- **Un platillo solo puede pertenecer a un darkitchen**. El `darkitchenId` debe ser válido.
- **Los precios están en pesos mexicanos** (puedes cambiarlos según tu moneda).
- **El script NO elimina platillos existentes**, solo agrega nuevos.

## 🔒 Seguridad

⚠️ **NO subas el script con tus credenciales a Git**. Agrega la configuración al `.gitignore`:

```gitignore
scripts/seed-dishes.js
scripts/*.config.ts
```

## 📝 Solución de Problemas

### Error: "Permission denied"

- Verifica que las reglas de Firestore permitan escritura
- Asegúrate de estar autenticado si es necesario

### Error: "darkitchenId inválido"

- Verifica que el ID exista en la colección `darkitchens`
- Copia el ID exacto desde Firebase Console

### Error: "Module not found: firebase"

- Ejecuta `npm install firebase`

## 🎯 Próximos pasos

Después de poblar los platillos:

1. Verifica en Firebase Console que se crearon correctamente
2. Abre la app y navega a la sección de platillos
3. Verifica que se muestren correctamente
4. Puedes crear solicitudes de prueba usando estos platillos

## 📞 Soporte

Si tienes problemas, verifica:

- La configuración de Firebase
- Que el darkitchenId sea válido
- Los logs de la consola para errores específicos
