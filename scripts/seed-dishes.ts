import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
const firebaseConfig = {

    apiKey: "AIzaSyC2b7-nn6rr3rLlR9e4lJCs5BUd4-5-VGE",
    authDomain: "darkitchen-388d0.firebaseapp.com",
    projectId: "darkitchen-388d0",
    storageBucket: "darkitchen-388d0.firebasestorage.app",
    messagingSenderId: "387175642254",
    appId: "1:387175642254:web:1a3e5cb5b8aa6dd04d45df",
    measurementId: "G-36GQBBQ5L5"

};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de ejemplo de platillos
const sampleDishes = [
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI', // Reemplazar con un ID real de darkitchen
        name: 'Pizza Margarita',
        description: 'Pizza tradicional con tomate, mozzarella fresca, albahaca y aceite de oliva',
        price: 150,
        category: 'Pizzas',
        images: [
            'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        ],
        available: true,
        preparationTime: 20, // minutos
        options: {
            sizes: ['Pequeña', 'Mediana', 'Grande'],
            extras: ['Queso extra', 'Champiñones', 'Pepperoni', 'Aceitunas']
        },
        tags: ['italiana', 'vegetariana', 'pizza'],
        rating: 4.5,
        reviewCount: 23,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Hamburguesa Clásica',
        description: 'Carne 100% de res, lechuga, tomate, cebolla, pepinillos y salsa especial',
        price: 120,
        category: 'Hamburguesas',
        images: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
        ],
        available: true,
        preparationTime: 15,
        options: {
            points: ['Término medio', 'Bien cocida', 'Tres cuartos'],
            extras: ['Queso cheddar', 'Tocino', 'Aguacate', 'Huevo frito', 'Jalapeños']
        },
        tags: ['hamburguesa', 'carne', 'americana'],
        rating: 4.7,
        reviewCount: 45,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Tacos al Pastor',
        description: '5 tacos de pastor con piña, cilantro, cebolla y salsa verde',
        price: 85,
        category: 'Tacos',
        images: [
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
        ],
        available: true,
        preparationTime: 10,
        options: {
            toppings: ['Piña', 'Cilantro', 'Cebolla', 'Limón'],
            salsas: ['Verde', 'Roja', 'Habanera', 'Chipotle']
        },
        tags: ['mexicana', 'tacos', 'pastor', 'tradicional'],
        rating: 4.8,
        reviewCount: 67,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Sushi Roll California',
        description: '10 piezas de roll california con cangrejo, aguacate y pepino',
        price: 180,
        category: 'Sushi',
        images: [
            'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        ],
        available: true,
        preparationTime: 25,
        options: {
            accompaniments: ['Salsa de soya', 'Wasabi', 'Jengibre encurtido'],
            extras: ['Philadelphia roll', 'Tempura roll', 'Edamame']
        },
        tags: ['japonesa', 'sushi', 'saludable', 'pescado'],
        rating: 4.6,
        reviewCount: 34,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Pasta Carbonara',
        description: 'Pasta con salsa cremosa de huevo, queso parmesano y tocino',
        price: 140,
        category: 'Pastas',
        images: [
            'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
        ],
        available: true,
        preparationTime: 20,
        options: {
            pasta: ['Espagueti', 'Fettuccine', 'Penne'],
            extras: ['Pollo', 'Champiñones', 'Verduras']
        },
        tags: ['italiana', 'pasta', 'cremosa'],
        rating: 4.4,
        reviewCount: 28,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Ensalada César',
        description: 'Lechuga romana, crutones, queso parmesano y aderezo césar',
        price: 95,
        category: 'Ensaladas',
        images: [
            'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
        ],
        available: true,
        preparationTime: 10,
        options: {
            protein: ['Pollo a la parrilla', 'Camarones', 'Salmón'],
            extras: ['Aguacate', 'Tocino', 'Huevo duro']
        },
        tags: ['ensalada', 'saludable', 'vegetariana'],
        rating: 4.3,
        reviewCount: 19,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Burrito de Carne Asada',
        description: 'Tortilla de harina rellena de carne asada, frijoles, arroz, guacamole y queso',
        price: 110,
        category: 'Burritos',
        images: [
            'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
        ],
        available: true,
        preparationTime: 15,
        options: {
            protein: ['Carne asada', 'Pollo', 'Pastor', 'Carnitas'],
            extras: ['Queso extra', 'Crema', 'Jalapeños', 'Pico de gallo']
        },
        tags: ['mexicana', 'burrito', 'carne'],
        rating: 4.6,
        reviewCount: 52,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Pollo Teriyaki',
        description: 'Trozos de pollo glaseados con salsa teriyaki, servidos con arroz y vegetales',
        price: 135,
        category: 'Platillos Asiáticos',
        images: [
            'https://images.unsplash.com/photo-1602986819752-c565d8e5b37e?w=800',
        ],
        available: true,
        preparationTime: 20,
        options: {
            sides: ['Arroz blanco', 'Arroz frito', 'Fideos'],
            extras: ['Vegetales extra', 'Huevo frito', 'Camarones']
        },
        tags: ['japonesa', 'pollo', 'teriyaki'],
        rating: 4.5,
        reviewCount: 31,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Alitas BBQ',
        description: '12 alitas de pollo con salsa BBQ, acompañadas de aderezo ranch',
        price: 125,
        category: 'Botanas',
        images: [
            'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800',
        ],
        available: true,
        preparationTime: 25,
        options: {
            sauces: ['BBQ', 'Buffalo', 'Mango Habanero', 'Honey Mustard', 'Teriyaki'],
            accompaniments: ['Ranch', 'Blue cheese', 'Papas fritas']
        },
        tags: ['americana', 'pollo', 'alitas', 'botana'],
        rating: 4.7,
        reviewCount: 61,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        darkitchenId: 'DARKITCHEN_ID_AQUI',
        name: 'Cheesecake de Fresa',
        description: 'Rebanada de pastel de queso con base de galleta y coulis de fresa',
        price: 75,
        category: 'Postres',
        images: [
            'https://images.unsplash.com/photo-1533134242820-b12d5cae7e1c?w=800',
        ],
        available: true,
        preparationTime: 5,
        options: {
            toppings: ['Fresas frescas', 'Chocolate', 'Crema batida', 'Caramelo']
        },
        tags: ['postre', 'dulce', 'cheesecake', 'fresa'],
        rating: 4.9,
        reviewCount: 42,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }
];

// Función para poblar la base de datos
async function seedDishes() {
    try {
        console.log('🌱 Iniciando seed de platillos...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const dish of sampleDishes) {
            try {
                const docRef = await addDoc(collection(db, 'dishes'), dish);
                console.log(`✅ Platillo creado: ${dish.name} (ID: ${docRef.id})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error al crear ${dish.name}:`, error);
                errorCount++;
            }
        }

        console.log('\n📊 Resumen:');
        console.log(`   ✅ Exitosos: ${successCount}`);
        console.log(`   ❌ Fallidos: ${errorCount}`);
        console.log(`   📝 Total: ${sampleDishes.length}`);
        console.log('\n✨ Seed completado!');

    } catch (error) {
        console.error('💥 Error general al ejecutar seed:', error);
        process.exit(1);
    }
}

// Ejecutar seed
seedDishes()
    .then(() => {
        console.log('\n👋 Proceso terminado. Puedes cerrar esta ventana.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
