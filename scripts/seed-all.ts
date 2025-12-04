cd scripts; npx ts - node seed - all.tscd scripts; npx ts - node seed - all.tsimport { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';

// Configuración de Firebase
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
const auth = getAuth(app);

// Datos de usuarios normales
const normalUsers = [
    {
        email: 'juan.perez@example.com',
        password: 'Password123!',
        displayName: 'Juan Pérez',
        phone: '+52 55 1234 5678',
        address: {
            street: 'Av. Reforma',
            number: '123',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '06600',
            country: 'México',
            additionalInfo: 'Depto 401',
            coordinates: {
                latitude: 19.4326,
                longitude: -99.1332
            }
        }
    },
    {
        email: 'maria.garcia@example.com',
        password: 'Password123!',
        displayName: 'María García',
        phone: '+52 55 2345 6789',
        address: {
            street: 'Calle Insurgentes',
            number: '456',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '03100',
            country: 'México',
            additionalInfo: 'Casa con portón negro',
            coordinates: {
                latitude: 19.3910,
                longitude: -99.1630
            }
        }
    },
    {
        email: 'carlos.lopez@example.com',
        password: 'Password123!',
        displayName: 'Carlos López',
        phone: '+52 55 3456 7890',
        address: {
            street: 'Av. Universidad',
            number: '789',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '04510',
            country: 'México',
            additionalInfo: 'Edificio A, Piso 3',
            coordinates: {
                latitude: 19.3318,
                longitude: -99.1854
            }
        }
    }
];

// Datos de usuarios con darkitchen
const darkitchenOwners = [
    {
        email: 'ana.martinez@example.com',
        password: 'Password123!',
        displayName: 'Ana Martínez',
        phone: '+52 55 4567 8901',
        address: {
            street: 'Calle Polanco',
            number: '321',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '11560',
            country: 'México',
            additionalInfo: 'Local comercial',
            coordinates: {
                latitude: 19.4363,
                longitude: -99.1910
            }
        },
        darkitchen: {
            name: 'La Cocina de Ana',
            description: 'Comida casera mexicana hecha con amor y los mejores ingredientes',
            avatarUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
            deliveryEnabled: true,
            pickupEnabled: true,
            rating: 4.8
        }
    },
    {
        email: 'roberto.diaz@example.com',
        password: 'Password123!',
        displayName: 'Roberto Díaz',
        phone: '+52 55 5678 9012',
        address: {
            street: 'Av. Chapultepec',
            number: '654',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '06140',
            country: 'México',
            additionalInfo: 'Cocina en planta baja',
            coordinates: {
                latitude: 19.4205,
                longitude: -99.1680
            }
        },
        darkitchen: {
            name: 'Sabores Italiani',
            description: 'Auténtica comida italiana con recetas tradicionales de la Toscana',
            avatarUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
            deliveryEnabled: true,
            pickupEnabled: true,
            rating: 4.6
        }
    },
    {
        email: 'laura.hernandez@example.com',
        password: 'Password123!',
        displayName: 'Laura Hernández',
        phone: '+52 55 6789 0123',
        address: {
            street: 'Calle Condesa',
            number: '987',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '06140',
            country: 'México',
            additionalInfo: 'Casa blanca con jardín',
            coordinates: {
                latitude: 19.4118,
                longitude: -99.1707
            }
        },
        darkitchen: {
            name: 'Asiático Express',
            description: 'Lo mejor de la cocina asiática: sushi, ramen, y platillos orientales',
            avatarUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
            deliveryEnabled: true,
            pickupEnabled: false,
            rating: 4.7
        }
    }
];

// Platillos para cada darkitchen
const dishesTemplates = {
    'La Cocina de Ana': [
        {
            name: 'Enchiladas Verdes',
            description: 'Tortillas de maíz rellenas de pollo, bañadas en salsa verde con crema y queso',
            price: 95,
            category: 'Platillos Mexicanos',
            images: ['https://images.unsplash.com/photo-1599974811765-9f7118d0fc6c?w=800'],
            available: true,
            preparationTime: 20,
            options: {
                extras: ['Crema extra', 'Queso extra', 'Arroz', 'Frijoles']
            },
            tags: ['mexicana', 'pollo', 'enchiladas'],
            rating: 4.7,
            reviewCount: 35
        },
        {
            name: 'Mole Poblano',
            description: 'Pechuga de pollo cubierta con mole tradicional, arroz y frijoles',
            price: 125,
            category: 'Platillos Mexicanos',
            images: ['https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800'],
            available: true,
            preparationTime: 25,
            options: {
                sides: ['Arroz blanco', 'Frijoles refritos', 'Tortillas']
            },
            tags: ['mexicana', 'mole', 'tradicional'],
            rating: 4.9,
            reviewCount: 42
        },
        {
            name: 'Quesadillas de Flor de Calabaza',
            description: '4 quesadillas de maíz rellenas de flor de calabaza y queso Oaxaca',
            price: 75,
            category: 'Antojitos',
            images: ['https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800'],
            available: true,
            preparationTime: 15,
            options: {
                extras: ['Guacamole', 'Crema', 'Salsa verde', 'Salsa roja']
            },
            tags: ['mexicana', 'quesadillas', 'vegetariana'],
            rating: 4.5,
            reviewCount: 28
        }
    ],
    'Sabores Italiani': [
        {
            name: 'Lasagna Bolognesa',
            description: 'Capas de pasta con carne molida, salsa bechamel y queso gratinado',
            price: 155,
            category: 'Pastas',
            images: ['https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800'],
            available: true,
            preparationTime: 30,
            options: {
                extras: ['Ensalada', 'Pan de ajo', 'Queso parmesano extra']
            },
            tags: ['italiana', 'pasta', 'lasagna'],
            rating: 4.8,
            reviewCount: 51
        },
        {
            name: 'Pizza Quattro Formaggi',
            description: 'Pizza artesanal con cuatro quesos: mozzarella, gorgonzola, parmesano y fontina',
            price: 165,
            category: 'Pizzas',
            images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
            available: true,
            preparationTime: 20,
            options: {
                sizes: ['Pequeña', 'Mediana', 'Grande'],
                extras: ['Jamón', 'Champiñones', 'Aceitunas']
            },
            tags: ['italiana', 'pizza', 'queso'],
            rating: 4.6,
            reviewCount: 39
        },
        {
            name: 'Risotto ai Funghi',
            description: 'Arroz arborio cremoso con mezcla de hongos y queso parmesano',
            price: 145,
            category: 'Arroces',
            images: ['https://images.unsplash.com/photo-1476124369491-c6c96ff75d3d?w=800'],
            available: true,
            preparationTime: 25,
            options: {
                extras: ['Trufa', 'Vino blanco', 'Hongos extra']
            },
            tags: ['italiana', 'risotto', 'hongos'],
            rating: 4.7,
            reviewCount: 33
        }
    ],
    'Asiático Express': [
        {
            name: 'Ramen Tonkotsu',
            description: 'Fideos en caldo de hueso de cerdo con chashu, huevo marinado y vegetales',
            price: 135,
            category: 'Sopas',
            images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800'],
            available: true,
            preparationTime: 20,
            options: {
                extras: ['Huevo extra', 'Chashu extra', 'Nori', 'Bambú']
            },
            tags: ['japonesa', 'ramen', 'sopa'],
            rating: 4.9,
            reviewCount: 67
        },
        {
            name: 'Pad Thai',
            description: 'Fideos de arroz salteados con camarones, tofu, cacahuates y tamarindo',
            price: 125,
            category: 'Fideos',
            images: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800'],
            available: true,
            preparationTime: 18,
            options: {
                protein: ['Camarones', 'Pollo', 'Tofu', 'Mixto'],
                extras: ['Picante extra', 'Cacahuates extra', 'Limón']
            },
            tags: ['tailandesa', 'fideos', 'camarones'],
            rating: 4.6,
            reviewCount: 44
        },
        {
            name: 'Gyozas de Cerdo',
            description: '8 empanadillas japonesas rellenas de cerdo y vegetales, al vapor o fritas',
            price: 85,
            category: 'Entradas',
            images: ['https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800'],
            available: true,
            preparationTime: 12,
            options: {
                preparation: ['Al vapor', 'Fritas', 'Mixtas'],
                accompaniments: ['Salsa de soya', 'Vinagre', 'Aceite de chile']
            },
            tags: ['japonesa', 'gyoza', 'entrada'],
            rating: 4.8,
            reviewCount: 56
        }
    ]
};

// Solicitudes para usuarios normales
const requestsTemplates = [
    {
        title: 'Busco tacos al pastor para cena',
        description: 'Necesito una orden de tacos al pastor para 3 personas, con todas las salsas',
        keywords: ['tacos', 'pastor', 'mexicana', 'cena'],
        paymentMethod: 'CASH' as const,
        expiresInHours: 3
    },
    {
        title: 'Pizza familiar para hoy',
        description: 'Quiero una pizza grande, preferiblemente con pepperoni o carnes',
        keywords: ['pizza', 'italiana', 'familiar', 'delivery'],
        paymentMethod: 'CARD' as const,
        expiresInHours: 2
    },
    {
        title: 'Comida saludable para almuerzo',
        description: 'Busco opciones de ensaladas o bowls saludables con proteína',
        keywords: ['saludable', 'ensalada', 'bowl', 'almuerzo'],
        paymentMethod: 'TRANSFER' as const,
        expiresInHours: 1
    }
];

// Función auxiliar para crear usuario en Authentication y Firestore
async function createUser(userData: typeof normalUsers[0], hasDarkitchen: boolean = false) {
    try {
        // Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );
        const user = userCredential.user;

        // Actualizar perfil
        await updateProfile(user, {
            displayName: userData.displayName
        });

        // Crear documento en Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: userData.email,
            displayName: userData.displayName,
            phone: userData.phone,
            address: userData.address,
            createdAt: Timestamp.now()
        });

        console.log(`✅ Usuario creado: ${userData.displayName} (${user.uid})`);
        return user.uid;
    } catch (error: any) {
        console.error(`❌ Error al crear usuario ${userData.email}:`, error.message);
        throw error;
    }
}

// Función para crear darkitchen
async function createDarkitchen(ownerId: string, darkitchenData: any) {
    try {
        const docRef = await addDoc(collection(db, 'darkitchens'), {
            ownerId,
            name: darkitchenData.name,
            description: darkitchenData.description,
            avatarUrl: darkitchenData.avatarUrl,
            deliveryEnabled: darkitchenData.deliveryEnabled,
            pickupEnabled: darkitchenData.pickupEnabled,
            rating: darkitchenData.rating,
            createdAt: Timestamp.now(),
            settings: {
                defaultPreparationTime: 20,
                acceptsPayments: true
            }
        });

        console.log(`✅ Darkitchen creada: ${darkitchenData.name} (${docRef.id})`);
        return docRef.id;
    } catch (error: any) {
        console.error(`❌ Error al crear darkitchen ${darkitchenData.name}:`, error.message);
        throw error;
    }
}

// Función para crear platillos
async function createDish(darkitchenId: string, dishData: any) {
    try {
        await addDoc(collection(db, 'dishes'), {
            darkitchenId,
            name: dishData.name,
            description: dishData.description,
            price: dishData.price,
            category: dishData.category,
            images: dishData.images,
            available: dishData.available,
            preparationTime: dishData.preparationTime,
            options: dishData.options,
            tags: dishData.tags,
            rating: dishData.rating,
            reviewCount: dishData.reviewCount,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        console.log(`   ✅ Platillo creado: ${dishData.name}`);
    } catch (error: any) {
        console.error(`   ❌ Error al crear platillo ${dishData.name}:`, error.message);
    }
}

// Función para crear solicitud
async function createRequest(userId: string, userAddress: any, requestData: any) {
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + requestData.expiresInHours);

        await addDoc(collection(db, 'requests'), {
            userId,
            title: requestData.title,
            description: requestData.description,
            keywords: requestData.keywords,
            address: userAddress,
            paymentMethod: requestData.paymentMethod,
            status: 'OPEN',
            expiresAt: Timestamp.fromDate(expiresAt),
            createdAt: Timestamp.now()
        });

        console.log(`   ✅ Solicitud creada: ${requestData.title}`);
    } catch (error: any) {
        console.error(`   ❌ Error al crear solicitud:`, error.message);
    }
}

// Función principal
async function seedAll() {
    try {
        console.log('🌱 Iniciando seed completo de la base de datos...\n');

        console.log('👥 Creando usuarios normales...');
        const normalUserIds: string[] = [];
        for (let i = 0; i < normalUsers.length; i++) {
            const userId = await createUser(normalUsers[i]);
            normalUserIds.push(userId);

            // Crear solicitud para cada usuario normal
            console.log(`   📝 Creando solicitud para ${normalUsers[i].displayName}...`);
            await createRequest(userId, normalUsers[i].address, requestsTemplates[i]);
        }

        console.log('\n🏪 Creando usuarios con darkitchen...');
        for (let i = 0; i < darkitchenOwners.length; i++) {
            const owner = darkitchenOwners[i];
            const userId = await createUser(owner, true);

            // Crear darkitchen
            console.log(`   🏪 Creando darkitchen para ${owner.displayName}...`);
            const darkitchenId = await createDarkitchen(userId, owner.darkitchen);

            // Crear platillos para la darkitchen
            console.log(`   🍽️  Creando platillos para ${owner.darkitchen.name}...`);
            const dishes = dishesTemplates[owner.darkitchen.name as keyof typeof dishesTemplates];
            for (const dish of dishes) {
                await createDish(darkitchenId, dish);
            }
        }

        console.log('\n✨ Seed completado exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`   👤 Usuarios normales: ${normalUsers.length}`);
        console.log(`   👨‍🍳 Usuarios con darkitchen: ${darkitchenOwners.length}`);
        console.log(`   🏪 Darkitchens: ${darkitchenOwners.length}`);
        console.log(`   🍽️  Platillos por darkitchen: 3`);
        console.log(`   📝 Solicitudes activas: ${normalUsers.length}`);
        console.log('\n👋 Proceso terminado. Puedes cerrar esta ventana.');

    } catch (error) {
        console.error('💥 Error general al ejecutar seed:', error);
        process.exit(1);
    }
}

// Ejecutar seed
seedAll()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
