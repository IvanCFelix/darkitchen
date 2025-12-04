# 📐 Arquitectura Técnica - DarKitchen

## 🎯 Visión General

DarKitchen es una aplicación mobile-first que conecta usuarios con cocinas virtuales (darkitchens) mediante un sistema de solicitudes y pedidos en tiempo real.

## 🏗️ Arquitectura de Software

### Clean Architecture + SOLID

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│   (Ionic Components + Angular Components)      │
│     - Pages (Smart Components)                  │
│     - Shared Components (Presentational)        │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│              Business Logic Layer               │
│              (Services + RxJS)                  │
│     - AuthService                               │
│     - DarkitchenService                         │
│     - RequestService                            │
│     - OrderService                              │
│     - DishService                               │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│              Data Layer                         │
│         (Firebase SDK + Models)                 │
│     - Firestore (NoSQL)                         │
│     - Authentication                            │
│     - Cloud Functions                           │
│     - Cloud Storage                             │
└─────────────────────────────────────────────────┘
```

### Principios SOLID Aplicados

1. **Single Responsibility**: Cada servicio tiene una única responsabilidad
2. **Open/Closed**: Extensible mediante interfaces y dependency injection
3. **Liskov Substitution**: Tipos intercambiables mediante abstracciones
4. **Interface Segregation**: Interfaces específicas por caso de uso
5. **Dependency Inversion**: Servicios inyectados, no instanciados directamente

## 📊 Modelo de Datos

### Diagrama ER (Entidad-Relación)

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│  USER    │◄────────│  DARKITCHEN  │────────►│   DISH   │
└────┬─────┘  owns   └──────┬───────┘  has    └────┬─────┘
     │                       │                      │
     │creates                │accepts               │
     │                       │                      │
┌────▼─────┐         ┌──────▼───────┐         ┌────▼─────┐
│ REQUEST  │────────►│    ORDER     │────────►│ HISTORY  │
└──────────┘ creates └──────────────┘ creates └──────────┘
```

### Colecciones Firestore

#### 1. users/{uid}

```typescript
{
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: Address;
  createdAt: Timestamp;
}
```

#### 2. darkitchens/{darkitchenId}

```typescript
{
  id: string;
  ownerId: string;  // FK to users
  name: string;
  description?: string;
  avatarUrl?: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  rating?: number;
  createdAt: Timestamp;
  settings?: {
    defaultPreparationTime?: number;
    acceptsPayments?: boolean;
  }
}
```

#### 3. dishes/{dishId}

```typescript
{
  id: string;
  darkitchenId: string;  // FK to darkitchens
  name: string;
  description?: string;
  price: number;
  images: string[];
  preparationTime: number;
  options: DishOption[];
  createdAt: Timestamp;
}
```

#### 4. requests/{requestId}

```typescript
{
  id: string;
  userId: string;  // FK to users
  title: string;
  description?: string;
  keywords: string[];
  address: Address;
  paymentMethod: 'CARD' | 'CASH' | 'TRANSFER';
  status: 'OPEN' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: Timestamp;
  createdAt: Timestamp;
  acceptedByDarkitchenId?: string;  // FK to darkitchens
  acceptedAt?: Timestamp;
}
```

#### 5. orders/{orderId}

```typescript
{
  id: string;
  requestId: string;  // FK to requests
  dishId: string;  // FK to dishes
  darkitchenId: string;  // FK to darkitchens
  darkitchenOwnerId: string;  // FK to users
  userId: string;  // FK to users
  price: number;
  deliveryType: 'DELIVERY' | 'PICKUP';
  status: OrderStatus;
  createdAt: Timestamp;
  paymentSimulation?: PaymentSimulation;
}
```

#### 6. orderStatusHistory/{historyId}

```typescript
{
  id: string;
  orderId: string; // FK to orders
  status: OrderStatus;
  timestamp: Timestamp;
  actorId: string; // FK to users
}
```

## 🔄 Flujos de Negocio

### Flujo 1: Registro de Usuario

```
Usuario → Register Page → AuthService.register()
         ↓
    Firebase Auth (create user)
         ↓
    Firestore users/{uid} (create document)
         ↓
    Navigate to /home
```

### Flujo 2: Crear Darkitchen

```
Usuario → Create Darkitchen Page → DarkitchenService.createDarkitchen()
         ↓
    Validate ownerId === auth.uid
         ↓
    Firestore darkitchens/{id} (create document)
         ↓
    Navigate to /darkitchen/dashboard
```

### Flujo 3: Crear y Aceptar Solicitud

```
CLIENTE:
Create Request Page → RequestService.createRequest()
         ↓
    Firestore requests/{id} (status: OPEN)
         ↓
    Cloud Function: onRequestCreated
         ↓
    Schedule expiration (10 min)

DARKITCHEN:
Search Requests Page → RequestService.getAllOpenRequests()
         ↓
    Display OPEN requests
         ↓
    Accept button → RequestService.acceptRequest()
         ↓
    Cloud Function: acceptRequest
         ↓
    Transaction:
      - Update request (status: ACCEPTED)
      - Create order (status: PRODUCTION)
      - Create orderStatusHistory entry
         ↓
    Notify client (future: FCM)
```

### Flujo 4: Actualizar Estado del Pedido

```
Darkitchen Dashboard → OrderService.updateOrderStatus()
         ↓
    Firestore orders/{id} (update status)
         ↓
    Cloud Function: onOrderStatusUpdate (trigger)
         ↓
    Create orderStatusHistory entry
         ↓
    Notify client (future: FCM)
```

## 🔐 Seguridad

### Firestore Security Rules - Matriz de Permisos

| Colección          | Read             | Create              | Update                 | Delete           |
| ------------------ | ---------------- | ------------------- | ---------------------- | ---------------- |
| users              | Solo owner       | Auth user           | Solo owner             | ❌               |
| darkitchens        | Auth user        | Owner only          | Owner only             | Owner only       |
| dishes             | Auth user        | Darkitchen owner    | Darkitchen owner       | Darkitchen owner |
| requests           | Auth user        | Request creator     | Request owner (cancel) | ❌               |
| orders             | Owner/Darkitchen | ❌ (Cloud Function) | Darkitchen owner       | ❌               |
| orderStatusHistory | Auth user        | Auto                | ❌                     | ❌               |

### Reglas Críticas

1. **Creación de Orders**: Solo Cloud Functions pueden crear orders
2. **Aceptar Requests**: Solo Cloud Functions pueden cambiar status a ACCEPTED
3. **Ownership**: Validación de ownerId === auth.uid
4. **Read Isolation**: Usuarios solo ven sus propios datos

## 🎨 Componentes UI

### Atomic Design

```
Atoms:
- ion-button
- ion-input
- ion-badge
- ion-icon

Molecules:
- SkeletonCardComponent
- SearchBar + Filters

Organisms:
- OrderCard
- RequestCard
- DarkitchenCard

Templates:
- AuthLayout
- DashboardLayout
- DetailLayout

Pages:
- LoginPage
- HomePage
- CreateRequestPage
- etc.
```

### Animaciones

```typescript
// Ionic Animations API
import { createAnimation } from '@ionic/angular';

// Angular Animations
import { trigger, transition, style, animate } from '@angular/animations';

Implementadas:
- fadeIn: Entrada suave
- slideInRight: Deslizar desde derecha
- slideInUp: Deslizar desde abajo
- listAnimation: Stagger en listas
- scaleIn: Escala con rebote
```

## 📱 Responsive Design

### Mobile First Breakpoints

```scss
// Base: 320px - 767px (Mobile)
// Default styles

// Tablet: 768px+
@media (min-width: 768px) {
  // Tablet styles
}

// Desktop: 1024px+
@media (min-width: 1024px) {
  // Desktop styles
}
```

## ☁️ Cloud Functions

### Arquitectura Serverless

```
Firebase Events → Cloud Functions → Firestore/Auth
                                  → FCM (future)
                                  → Cloud Tasks (future)
```

### Funciones Implementadas

1. **onRequestCreated** (Firestore Trigger)

   - Input: requests/{requestId} onCreate
   - Output: Schedule expiration
   - Use case: Auto-expire after 10 min

2. **expireRequest** (Callable Function)

   - Input: { requestId }
   - Output: Update request status to EXPIRED
   - Use case: Manual/scheduled expiration

3. **acceptRequest** (Callable Function)

   - Input: { requestId, darkitchenId, dishId, price }
   - Output: Create order, update request
   - Use case: Darkitchen accepts request
   - Security: Validates darkitchen ownership

4. **onOrderStatusUpdate** (Firestore Trigger)
   - Input: orders/{orderId} onUpdate
   - Output: Create history, notify user
   - Use case: Track status changes

## 🚀 Deployment

### Environments

```typescript
// Development
environment.ts
- Local Firebase emulators
- Debug mode enabled

// Production
environment.prod.ts
- Live Firebase project
- Production mode
- Minified bundles
```

### Build Process

```bash
1. npm install (dependencies)
2. ng build --configuration production
3. npx cap sync (mobile)
4. firebase deploy (hosting + functions + rules)
```

## 📊 Performance

### Optimizaciones

1. **Lazy Loading**: Módulos cargados bajo demanda
2. **OnPush Change Detection**: Reducción de ciclos de detección
3. **RxJS Operators**: debounceTime, distinctUntilChanged
4. **Firestore Indexes**: Queries optimizadas
5. **Image Optimization**: Compresión y lazy loading
6. **Bundle Size**: Tree shaking y code splitting

### Métricas Target

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle Size: < 500KB (main)
- Lighthouse Score: > 90

## 🧪 Testing Strategy

### Niveles de Testing

1. **Unit Tests**: Servicios y lógica de negocio
2. **Component Tests**: Componentes aislados
3. **E2E Tests**: Flujos completos
4. **Security Rules Tests**: Firestore rules

## 📈 Escalabilidad

### Estrategias

1. **Horizontal Scaling**: Cloud Functions auto-scale
2. **Firestore Sharding**: Distribución de lecturas
3. **Caching**: Service Worker + IndexedDB
4. **CDN**: Firebase Hosting global
5. **Batch Operations**: Reducir writes

## 🔮 Roadmap Futuro

1. **Push Notifications**: FCM integration
2. **Real-time Chat**: Firestore realtime listeners
3. **Payment Gateway**: Stripe/PayPal
4. **Analytics**: Firebase Analytics + Google Analytics
5. **A/B Testing**: Firebase Remote Config
6. **ML Recommendations**: Firebase ML Kit

---

**Versión**: 1.0.0  
**Última actualización**: 3 de diciembre de 2025  
**Arquitecto**: Lead Software Architect, Firebase Specialist, Senior Ionic Engineer
