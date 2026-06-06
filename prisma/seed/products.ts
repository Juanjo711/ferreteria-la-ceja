/**
 * Catálogo seed — 50 productos distribuidos en las 7 categorías.
 *
 * Convenciones:
 *   - SKU: <CAT-PREFIX>-<NNN>. Prefijos: TOR/HMA/HEL/CON/PLO/ELE/PIN.
 *   - price/comparePrice en pesos colombianos como entero.
 *   - 8 productos isFeatured = true (ver marcador).
 *   - 6 productos con stock < minStock (alertas del dashboard admin).
 *   - specs es un JSON arbitrario que depende de la categoría.
 */

export type ProductSeed = {
  sku: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  minStock: number;
  isFeatured?: boolean;
  categorySlug: string;
  brandSlug?: string;
  specs: Record<string, string>;
};

export const products: readonly ProductSeed[] = [
  // ====================== TORNILLERÍA (7) ===============================
  {
    sku: "TOR-001",
    name: "Tornillo hexagonal 1/4\" x 1\" galvanizado (caja x 100)",
    description:
      "Tornillo de cabeza hexagonal, rosca corrida, acabado galvanizado para protección contra corrosión. Ideal para fijación estructural en madera o metal. Presentación industrial por 100 unidades.",
    price: 8500,
    stock: 45,
    minStock: 10,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero al carbono",
      Calibre: '1/4"',
      Longitud: '1"',
      Acabado: "Galvanizado en caliente",
      Presentación: "Caja x 100 unidades",
    },
  },
  {
    sku: "TOR-002",
    name: "Tornillo autorroscante 8 x 1\" punta broca (caja x 50)",
    description:
      "Tornillo autorroscante con punta tipo broca; perfora y rosca lámina metálica sin pretaladrado. Cabeza hexagonal con arandela integrada para sello.",
    price: 12000,
    stock: 38,
    minStock: 8,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero endurecido",
      Calibre: "#8",
      Longitud: '1"',
      Tipo: "Autorroscante punta broca",
      Presentación: "Caja x 50 unidades",
    },
  },
  {
    sku: "TOR-003",
    name: "Tuerca hexagonal 5/16\" acero galvanizado (bolsa x 100)",
    description:
      "Tuerca hexagonal estándar, rosca UNC, galvanizada. Compatible con pernos y tornillos de calibre equivalente.",
    price: 9800,
    stock: 60,
    minStock: 15,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero galvanizado",
      Calibre: '5/16"',
      Rosca: "UNC",
      Presentación: "Bolsa x 100 unidades",
    },
  },
  {
    sku: "TOR-004",
    name: "Arandela plana 1/4\" galvanizada (bolsa x 100)",
    description:
      "Arandela plana para distribuir carga de fijación. Acabado galvanizado para evitar oxidación en exteriores.",
    price: 5500,
    stock: 80,
    minStock: 20,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero galvanizado",
      Diámetro: '1/4"',
      Tipo: "Plana",
      Presentación: "Bolsa x 100 unidades",
    },
  },
  {
    sku: "TOR-005",
    name: "Tornillo Phillips 6 x 1\" cabeza plana madera (caja x 100)",
    description:
      "Tornillo para madera con cabeza plana avellanada y impulso Phillips. Punta aguda autorroscante en madera blanda y dura.",
    price: 7200,
    stock: 52,
    minStock: 10,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero",
      Calibre: "#6",
      Longitud: '1"',
      Cabeza: "Plana avellanada",
      Impulso: "Phillips",
      Presentación: "Caja x 100 unidades",
    },
  },
  {
    sku: "TOR-006",
    name: "Perno de carruaje 3/8\" x 3\" galvanizado (caja x 25)",
    description:
      "Perno de carruaje con cabeza redonda y cuello cuadrado anti-rotación. Ideal para uniones estructurales en madera con tuerca y arandela.",
    price: 18500,
    stock: 24,
    minStock: 6,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero galvanizado",
      Calibre: '3/8"',
      Longitud: '3"',
      Tipo: "Carruaje cuello cuadrado",
      Presentación: "Caja x 25 unidades",
    },
  },
  {
    sku: "TOR-007",
    name: "Anclaje de expansión 1/2\" x 3\" (bolsa x 10)",
    description:
      "Anclaje mecánico de expansión por cuña para concreto y mampostería. Alta resistencia a tracción.",
    price: 22000,
    stock: 18,
    minStock: 5,
    categorySlug: "tornilleria",
    specs: {
      Material: "Acero zincado",
      Diámetro: '1/2"',
      Longitud: '3"',
      Sustrato: "Concreto y mampostería",
      Presentación: "Bolsa x 10 unidades",
    },
  },

  // ====================== HERRAMIENTAS MANUALES (7) =====================
  {
    sku: "HMA-001",
    name: "Martillo de carpintero 16 oz mango fibra de vidrio",
    description:
      "Martillo de uña con cabeza forjada de acero pulido y mango ergonómico de fibra de vidrio anti-vibración. Diseño profesional para uso intensivo.",
    price: 45000,
    stock: 22,
    minStock: 5,
    isFeatured: true,
    categorySlug: "herramientas-manuales",
    brandSlug: "stanley",
    specs: {
      "Tipo de cabeza": "Carpintero (uña)",
      Peso: "16 oz (453 g)",
      Mango: "Fibra de vidrio anti-vibración",
      Longitud: "33 cm",
      Garantía: "De por vida",
    },
  },
  {
    sku: "HMA-002",
    name: "Destornillador Phillips #2 x 6\" mango anti-deslizante",
    description:
      "Destornillador Phillips de uso profesional con punta magnetizada y mango bi-componente para máximo agarre.",
    price: 18000,
    stock: 35,
    minStock: 8,
    categorySlug: "herramientas-manuales",
    brandSlug: "stanley",
    specs: {
      Tipo: "Phillips",
      Tamaño: "#2",
      Longitud: '6" (15 cm)',
      Punta: "Magnetizada",
      Mango: "Bi-componente anti-deslizante",
    },
  },
  {
    sku: "HMA-003",
    name: "Llave inglesa ajustable 10\" cromada",
    description:
      "Llave ajustable de mordaza ancha con tornillo sin fin para apriete preciso. Acabado cromado resistente a corrosión.",
    price: 52000,
    stock: 18,
    minStock: 5,
    categorySlug: "herramientas-manuales",
    brandSlug: "stanley",
    specs: {
      Tipo: "Ajustable (inglesa)",
      Longitud: '10" (25 cm)',
      "Apertura máxima": "30 mm",
      Material: "Acero cromo-vanadio",
      Acabado: "Cromado",
    },
  },
  {
    sku: "HMA-004",
    name: "Alicate universal 8\" con mango aislado",
    description:
      "Alicate universal con función de corte, sujeción y pelado. Mangos con aislamiento eléctrico nivel 1000V.",
    price: 38000,
    stock: 25,
    minStock: 6,
    categorySlug: "herramientas-manuales",
    brandSlug: "stanley",
    specs: {
      Tipo: "Universal",
      Longitud: '8" (20 cm)',
      Material: "Acero cromo-vanadio forjado",
      "Aislamiento mango": "1000 V",
      Funciones: "Corte / sujeción / pelado",
    },
  },
  {
    sku: "HMA-005",
    name: "Juego de hexagonales 9 piezas (mm)",
    description:
      "Juego de llaves hexagonales tipo L métricas con sistema de almacenamiento plegable. Incluye medidas 1.5 a 10 mm.",
    price: 28000,
    stock: 30,
    minStock: 6,
    categorySlug: "herramientas-manuales",
    brandSlug: "bosch",
    specs: {
      Tipo: "Hexagonales tipo L",
      Sistema: "Métrico (mm)",
      Piezas: "9",
      Medidas: "1.5, 2, 2.5, 3, 4, 5, 6, 8, 10 mm",
      Material: "Acero cromo-vanadio",
    },
  },
  {
    sku: "HMA-006",
    name: "Sierra para metal con marco rígido 12\"",
    description:
      "Arco de sierra para metal con tensor de hoja, mango pistola ergonómico y hoja bimetálica incluida.",
    price: 35500,
    stock: 14,
    minStock: 4,
    categorySlug: "herramientas-manuales",
    brandSlug: "stanley",
    specs: {
      Tipo: "Arco rígido para metal",
      "Longitud hoja": '12" (30 cm)',
      Tensión: "Tornillo manual",
      "Hoja incluida": "Bimetálica 24 TPI",
      Material: "Marco de acero / mango plástico",
    },
  },
  {
    sku: "HMA-007",
    name: "Cinta métrica 5m x 19mm autobloqueo",
    description:
      "Cinta métrica con auto-freno, gancho magnético reforzado y carcasa anti-impacto con clip de cinturón.",
    price: 22500,
    stock: 40,
    minStock: 10,
    categorySlug: "herramientas-manuales",
    brandSlug: "stanley",
    specs: {
      Longitud: "5 m",
      "Ancho cinta": "19 mm",
      Bloqueo: "Autobloqueo",
      Gancho: "Magnético reforzado",
      Carcasa: "Anti-impacto con clip",
    },
  },

  // ====================== HERRAMIENTAS ELÉCTRICAS (7) ===================
  {
    sku: "HEL-001",
    name: "Taladro percutor 1/2\" 750W 110V",
    description:
      "Taladro percutor profesional con velocidad variable, reversa y selector de modos taladrado / percusión. Mandril metálico de cierre rápido.",
    price: 385000,
    comparePrice: 425000,
    stock: 3,
    minStock: 5,
    isFeatured: true,
    categorySlug: "herramientas-electricas",
    brandSlug: "dewalt",
    specs: {
      Potencia: "750 W",
      Voltaje: "110 V",
      Mandril: '1/2" metálico de cierre rápido',
      "Velocidad sin carga": "0–3000 RPM",
      Percusión: "0–48000 IPM",
      Peso: "2.3 kg",
      Garantía: "3 años",
    },
  },
  {
    sku: "HEL-002",
    name: "Esmeril angular 4-1/2\" 750W",
    description:
      "Esmeril angular profesional con interruptor de bloqueo, guarda ajustable sin herramienta y empuñadura lateral en dos posiciones.",
    price: 245000,
    stock: 12,
    minStock: 4,
    isFeatured: true,
    categorySlug: "herramientas-electricas",
    brandSlug: "bosch",
    specs: {
      Potencia: "750 W",
      "Diámetro de disco": '4-1/2" (115 mm)',
      "Velocidad sin carga": "11000 RPM",
      Rosca: "M14",
      Peso: "1.9 kg",
      Garantía: "2 años",
    },
  },
  {
    sku: "HEL-003",
    name: "Sierra circular 7-1/4\" 1400W con guía láser",
    description:
      "Sierra circular profesional con guía láser, ajuste de profundidad e inclinación hasta 45°. Incluye hoja de 24 dientes para madera.",
    price: 520000,
    stock: 8,
    minStock: 3,
    categorySlug: "herramientas-electricas",
    brandSlug: "makita",
    specs: {
      Potencia: "1400 W",
      "Diámetro de disco": '7-1/4" (184 mm)',
      "Velocidad sin carga": "5500 RPM",
      "Profundidad máx 90°": "65 mm",
      "Profundidad máx 45°": "45 mm",
      Incluye: "Hoja 24T, guía láser, llave",
      Peso: "3.7 kg",
    },
  },
  {
    sku: "HEL-004",
    name: "Atornillador inalámbrico 12V con 2 baterías de litio",
    description:
      "Atornillador inalámbrico compacto con 2 baterías Li-Ion de 1.5Ah, cargador rápido y maletín. Ideal para uso doméstico y mantenimiento.",
    price: 295000,
    stock: 10,
    minStock: 3,
    categorySlug: "herramientas-electricas",
    brandSlug: "black-and-decker",
    specs: {
      Voltaje: "12 V (Li-Ion)",
      "Baterías incluidas": "2 × 1.5 Ah",
      "Velocidad sin carga": "0–650 RPM",
      "Torque máx": "16 Nm",
      Posiciones: "20 + taladro",
      Incluye: "Cargador rápido, maletín, broca de prueba",
    },
  },
  {
    sku: "HEL-005",
    name: "Lijadora orbital 1/4 hoja 240W",
    description:
      "Lijadora orbital compacta con sistema de recolección de polvo, base de velcro y empuñadura suave anti-vibración.",
    price: 185000,
    stock: 7,
    minStock: 3,
    categorySlug: "herramientas-electricas",
    brandSlug: "bosch",
    specs: {
      Potencia: "240 W",
      "Tipo hoja": "1/4 (114 × 140 mm)",
      Órbitas: "14000 OPM",
      Fijación: "Velcro",
      "Recolección de polvo": "Bolsa integrada",
      Peso: "1.6 kg",
    },
  },
  {
    sku: "HEL-006",
    name: "Rotomartillo SDS-Plus 800W con maletín",
    description:
      "Rotomartillo de 3 modos (taladrado, percusión y demolición) con mandril SDS-Plus de cambio rápido. Profesional para concreto y mampostería.",
    price: 720000,
    comparePrice: 850000,
    stock: 1,
    minStock: 5,
    isFeatured: true,
    categorySlug: "herramientas-electricas",
    brandSlug: "milwaukee",
    specs: {
      Potencia: "800 W",
      Mandril: "SDS-Plus",
      Modos: "3 (taladro / percusión / cincelado)",
      "Energía de impacto": "2.8 J",
      "Velocidad sin carga": "0–1100 RPM",
      Incluye: "3 brocas SDS, 1 cincel, maletín",
      Peso: "3.1 kg",
    },
  },
  {
    sku: "HEL-007",
    name: "Caladora pendular 650W velocidad variable",
    description:
      "Caladora pendular con 4 posiciones de oscilación, velocidad variable y sistema sin herramientas para cambio de hoja.",
    price: 310000,
    stock: 6,
    minStock: 3,
    categorySlug: "herramientas-electricas",
    brandSlug: "dewalt",
    specs: {
      Potencia: "650 W",
      "Velocidad sin carga": "500–3000 SPM",
      "Profundidad madera": "85 mm",
      "Profundidad metal": "10 mm",
      Oscilación: "4 posiciones",
      "Cambio de hoja": "Sin herramientas",
    },
  },

  // ====================== CONSTRUCCIÓN (7) ==============================
  {
    sku: "CON-001",
    name: "Cemento gris 50kg Argos",
    description:
      "Cemento Pórtland tipo I de uso general para concretos, morteros y pega de mampostería. Cumple norma NTC 121.",
    price: 48000,
    stock: 80,
    minStock: 20,
    isFeatured: true,
    categorySlug: "construccion",
    specs: {
      Tipo: "Pórtland Tipo I",
      Presentación: "Saco 50 kg",
      Norma: "NTC 121",
      Color: "Gris",
      Uso: "General (concreto y morteros)",
    },
  },
  {
    sku: "CON-002",
    name: "Arena lavada de río bulto 40kg",
    description:
      "Arena lavada de río, granulometría fina, libre de materia orgánica. Para mezclas de mortero, pañetes y mampostería.",
    price: 18500,
    stock: 0,
    minStock: 10,
    categorySlug: "construccion",
    specs: {
      Tipo: "Lavada de río",
      Presentación: "Bulto 40 kg",
      Granulometría: "Fina",
      Uso: "Mortero y pañete",
    },
  },
  {
    sku: "CON-003",
    name: "Bloque de concreto 10x20x40cm",
    description:
      "Bloque hueco de concreto vibrocomprimido. Para muros divisorios y mampostería estructural en obra gris.",
    price: 1850,
    stock: 240,
    minStock: 50,
    categorySlug: "construccion",
    specs: {
      Material: "Concreto vibrocomprimido",
      Dimensiones: "10 × 20 × 40 cm",
      Tipo: "Hueco",
      "Resistencia mínima": "4 MPa",
    },
  },
  {
    sku: "CON-004",
    name: "Varilla corrugada 1/2\" x 6m (12mm)",
    description:
      "Varilla de refuerzo corrugada grado 60 para refuerzo estructural en concreto.",
    price: 42000,
    stock: 65,
    minStock: 15,
    categorySlug: "construccion",
    specs: {
      Tipo: "Corrugada",
      Diámetro: '1/2" (12 mm)',
      Longitud: "6 m",
      Grado: "60 (420 MPa)",
      Norma: "NTC 2289",
    },
  },
  {
    sku: "CON-005",
    name: "Ladrillo tolete macizo común",
    description:
      "Ladrillo macizo de arcilla cocida. Tradicional para muros estructurales y obra a la vista.",
    price: 1200,
    stock: 480,
    minStock: 100,
    categorySlug: "construccion",
    specs: {
      Material: "Arcilla cocida",
      Tipo: "Macizo tolete",
      Dimensiones: "6 × 12 × 24 cm",
      Uso: "Muros estructurales / obra vista",
    },
  },
  {
    sku: "CON-006",
    name: "Malla electrosoldada 6mm 2.35x6m",
    description:
      "Malla electrosoldada para refuerzo de losas, placas y pisos. Cuadrícula 15 × 15 cm.",
    price: 185000,
    stock: 22,
    minStock: 6,
    categorySlug: "construccion",
    specs: {
      "Diámetro alambre": "6 mm",
      "Dimensiones panel": "2.35 × 6 m",
      Cuadrícula: "15 × 15 cm",
      Grado: "60",
      Uso: "Refuerzo de losas y pisos",
    },
  },
  {
    sku: "CON-007",
    name: "Yeso de construcción 25kg",
    description:
      "Yeso fino para acabados, enlucidos y reparaciones interiores. Endurecimiento rápido y superficie lisa.",
    price: 32000,
    stock: 4,
    minStock: 10,
    categorySlug: "construccion",
    specs: {
      Tipo: "Yeso fino para acabados",
      Presentación: "Saco 25 kg",
      Endurecimiento: "20–30 min",
      Uso: "Enlucidos y reparaciones",
    },
  },

  // ====================== PLOMERÍA (7) ==================================
  {
    sku: "PLO-001",
    name: "Tubo PVC presión 1/2\" x 6m RDE 13.5",
    description:
      "Tubo PVC de presión para acueducto y agua potable. Norma NTC 382. Para sistemas de agua fría hasta 200 PSI.",
    price: 18500,
    stock: 50,
    minStock: 10,
    isFeatured: true,
    categorySlug: "plomeria",
    specs: {
      Material: "PVC",
      Diámetro: '1/2"',
      Longitud: "6 m",
      RDE: "13.5",
      "Presión máxima": "200 PSI",
      Norma: "NTC 382",
    },
  },
  {
    sku: "PLO-002",
    name: "Codo PVC 90° 1/2\" presión",
    description: "Codo de presión a 90° con extremos lisos para soldar. Material PVC para agua potable.",
    price: 2500,
    stock: 120,
    minStock: 20,
    categorySlug: "plomeria",
    specs: {
      Material: "PVC presión",
      Ángulo: "90°",
      Diámetro: '1/2"',
      Tipo: "Lisa-lisa para soldar",
    },
  },
  {
    sku: "PLO-003",
    name: "Unión universal PVC 1\" presión",
    description: "Unión universal de tres piezas para PVC, permite desmontar líneas sin cortar.",
    price: 8500,
    stock: 38,
    minStock: 8,
    categorySlug: "plomeria",
    specs: {
      Material: "PVC presión",
      Diámetro: '1"',
      Tipo: "Universal 3 piezas",
      Empaque: "EPDM",
    },
  },
  {
    sku: "PLO-004",
    name: "Llave de paso bola 1/2\" en bronce",
    description:
      "Válvula de paso tipo bola en bronce con manija de palanca. Cierre rápido un cuarto de vuelta.",
    price: 32000,
    stock: 28,
    minStock: 6,
    categorySlug: "plomeria",
    specs: {
      Material: "Bronce",
      Tipo: "Bola",
      Diámetro: '1/2"',
      Conexión: "Roscada NPT",
      "Cierre": "1/4 de vuelta",
    },
  },
  {
    sku: "PLO-005",
    name: "Sifón flexible PVC 1-1/4\" extensible",
    description: "Sifón flexible y extensible para lavamanos y lavaplatos. Fácil instalación sin herramientas especiales.",
    price: 12500,
    stock: 32,
    minStock: 8,
    categorySlug: "plomeria",
    specs: {
      Material: "PVC corrugado",
      Diámetro: '1-1/4"',
      Longitud: "extensible 30–80 cm",
      Uso: "Lavamanos / lavaplatos",
    },
  },
  {
    sku: "PLO-006",
    name: "Tanque sanitario universal completo con accesorios",
    description:
      "Tanque sanitario de porcelana con todos los accesorios internos. Incluye palanca, válvula de llenado, válvula de descarga y tornillería.",
    price: 185000,
    stock: 2,
    minStock: 5,
    categorySlug: "plomeria",
    specs: {
      Material: "Porcelana sanitaria",
      Capacidad: "6 L",
      Tipo: "Universal con accesorios",
      Color: "Blanco",
      Incluye: "Palanca, válvulas y tornillería",
    },
  },
  {
    sku: "PLO-007",
    name: "Manguera para jardín 1/2\" x 25m reforzada",
    description: "Manguera para jardín reforzada con malla, alta flexibilidad y resistencia al UV.",
    price: 65000,
    stock: 15,
    minStock: 4,
    categorySlug: "plomeria",
    specs: {
      Material: "PVC reforzado con malla",
      Diámetro: '1/2"',
      Longitud: "25 m",
      "Presión de trabajo": "8 bar",
      "Resistencia UV": "Sí",
    },
  },

  // ====================== ELÉCTRICOS (7) ================================
  {
    sku: "ELE-001",
    name: "Cable encauchetado 3x12 AWG por metro",
    description:
      "Cable encauchetado uso rudo con 3 conductores calibre 12 AWG. Para extensiones y conexiones de electrodomésticos de mediana carga.",
    price: 4800,
    stock: 250,
    minStock: 50,
    isFeatured: true,
    categorySlug: "electricos",
    specs: {
      Tipo: "Encauchetado uso rudo",
      Conductores: "3 × 12 AWG",
      Voltaje: "600 V",
      "Cubierta": "PVC negra",
      Norma: "NTC 2050 / RETIE",
    },
  },
  {
    sku: "ELE-002",
    name: "Bombillo LED 9W luz fría E27",
    description:
      "Bombillo LED de 9W equivalente a 75W incandescente. Luz blanca fría 6500K, base E27 estándar.",
    price: 8500,
    stock: 180,
    minStock: 40,
    categorySlug: "electricos",
    specs: {
      Potencia: "9 W (≈ 75 W incandescente)",
      "Flujo luminoso": "850 lm",
      "Temperatura de color": "6500 K (frío)",
      Base: "E27",
      Voltaje: "100–240 V",
      "Vida útil": "25 000 h",
    },
  },
  {
    sku: "ELE-003",
    name: "Tomacorriente doble con polo a tierra blanco",
    description:
      "Tomacorriente doble polarizado para empotrar. Cumple norma RETIE. Color blanco con placa.",
    price: 14500,
    stock: 90,
    minStock: 20,
    categorySlug: "electricos",
    specs: {
      Tipo: "Doble polarizado con tierra",
      Voltaje: "120 V",
      Amperaje: "15 A",
      Color: "Blanco",
      Norma: "RETIE",
      Instalación: "Empotrar",
    },
  },
  {
    sku: "ELE-004",
    name: "Interruptor sencillo blanco con placa",
    description:
      "Interruptor de un polo (sencillo) con placa, color blanco. Instalación empotrada en caja rectangular estándar.",
    price: 7200,
    stock: 110,
    minStock: 25,
    categorySlug: "electricos",
    specs: {
      Tipo: "Sencillo (1 polo)",
      Voltaje: "120 V",
      Amperaje: "15 A",
      Color: "Blanco",
      "Incluye placa": "Sí",
    },
  },
  {
    sku: "ELE-005",
    name: "Tablero monofásico de 8 circuitos enchufable",
    description:
      "Tablero monofásico para 8 circuitos breaker enchufable. Incluye barra de tierra y neutro. Norma RETIE.",
    price: 145000,
    stock: 18,
    minStock: 5,
    categorySlug: "electricos",
    specs: {
      Tipo: "Monofásico enchufable",
      Circuitos: "8",
      "Tensión nominal": "120/240 V",
      "Corriente nominal": "100 A",
      "Incluye barras": "Tierra y neutro",
      Norma: "RETIE",
    },
  },
  {
    sku: "ELE-006",
    name: "Breaker enchufable 1x20A",
    description:
      "Breaker termomagnético enchufable de 1 polo, 20A. Compatible con tableros enchufables estándar.",
    price: 18500,
    stock: 60,
    minStock: 15,
    categorySlug: "electricos",
    specs: {
      Tipo: "Termomagnético enchufable",
      Polos: "1",
      Amperaje: "20 A",
      Voltaje: "120 V",
      "Capacidad de interrupción": "10 kA",
    },
  },
  {
    sku: "ELE-007",
    name: "Panel LED 60x60cm 36W luz fría",
    description:
      "Panel LED para techo de oficina o local comercial. Luz blanca fría uniforme. Incluye driver.",
    price: 85000,
    stock: 24,
    minStock: 6,
    categorySlug: "electricos",
    specs: {
      Potencia: "36 W",
      Dimensiones: "60 × 60 cm",
      "Flujo luminoso": "3200 lm",
      "Temperatura de color": "6500 K (frío)",
      Voltaje: "100–240 V",
      Instalación: "Incrustado / sobrepuesto",
    },
  },

  // ====================== PINTURAS (8) ==================================
  {
    sku: "PIN-001",
    name: "Pintura vinilo blanco galón [Pintuco]",
    description:
      "Pintura vinilo tipo 1 blanco para interiores. Acabado mate, alta cubrición, lavable.",
    price: 68000,
    comparePrice: 78000,
    stock: 32,
    minStock: 8,
    isFeatured: true,
    categorySlug: "pinturas",
    specs: {
      Tipo: "Vinilo tipo 1",
      Color: "Blanco",
      Acabado: "Mate",
      Presentación: "Galón (3.785 L)",
      Rendimiento: "30–40 m² / galón",
      Secado: "Tacto 30 min, repintar 2 h",
      Base: "Agua",
    },
  },
  {
    sku: "PIN-002",
    name: "Pintura anticorrosiva gris cuarto de galón",
    description:
      "Pintura anticorrosiva para superficies metálicas. Excelente adherencia y protección anti-óxido.",
    price: 42500,
    stock: 28,
    minStock: 6,
    categorySlug: "pinturas",
    specs: {
      Tipo: "Anticorrosiva alquídica",
      Color: "Gris",
      Presentación: "1/4 galón",
      Rendimiento: "8–10 m² / 1/4 gal",
      Secado: "Tacto 1 h, repintar 6 h",
      Base: "Solvente",
    },
  },
  {
    sku: "PIN-003",
    name: "Esmalte sintético blanco galón",
    description:
      "Esmalte sintético brillante para madera y metal. Alta resistencia al desgaste y la intemperie.",
    price: 78000,
    stock: 20,
    minStock: 5,
    categorySlug: "pinturas",
    specs: {
      Tipo: "Esmalte sintético",
      Color: "Blanco",
      Acabado: "Brillante",
      Presentación: "Galón (3.785 L)",
      Rendimiento: "25–30 m² / galón",
      Secado: "Tacto 4 h, repintar 24 h",
      Base: "Solvente",
    },
  },
  {
    sku: "PIN-004",
    name: "Solvente mineral aguarrás 1L",
    description:
      "Solvente mineral para limpieza de brochas, dilución de esmaltes sintéticos y eliminación de residuos.",
    price: 15500,
    stock: 45,
    minStock: 10,
    categorySlug: "pinturas",
    specs: {
      Tipo: "Solvente mineral (aguarrás)",
      Presentación: "1 L",
      Uso: "Dilución / limpieza",
      "Punto inflamación": "> 38 °C",
    },
  },
  {
    sku: "PIN-005",
    name: "Pintura epóxica para piso cuarto gris",
    description:
      "Pintura epóxica bicomponente para pisos de concreto. Alta resistencia química y mecánica.",
    price: 185000,
    stock: 12,
    minStock: 4,
    categorySlug: "pinturas",
    specs: {
      Tipo: "Epóxica bicomponente",
      Color: "Gris",
      Presentación: "1/4 galón (kit A + B)",
      Rendimiento: "5–7 m² / 1/4 gal",
      Secado: "Tacto 6 h, tránsito 24 h, curado total 7 días",
      Resistencia: "Química y mecánica alta",
    },
  },
  {
    sku: "PIN-006",
    name: "Brocha 3\" cerda natural mango madera",
    description:
      "Brocha profesional de 3 pulgadas con cerda natural y mango ergonómico de madera. Para esmaltes y pinturas a base de solvente.",
    price: 9800,
    stock: 55,
    minStock: 12,
    categorySlug: "pinturas",
    specs: {
      Ancho: '3" (76 mm)',
      Cerda: "Natural",
      Mango: "Madera",
      Uso: "Esmaltes / base solvente",
    },
  },
  {
    sku: "PIN-007",
    name: "Rodillo antigota 9\" + base + bandeja",
    description:
      "Kit completo de rodillo antigota 9 pulgadas con felpa de microfibra, base metálica y bandeja plástica.",
    price: 18500,
    stock: 3,
    minStock: 5,
    categorySlug: "pinturas",
    specs: {
      Ancho: '9" (23 cm)',
      Felpa: "Microfibra antigota",
      Incluye: "Rodillo, base, bandeja",
      Uso: "Pinturas a base de agua",
    },
  },
  {
    sku: "PIN-008",
    name: "Cinta enmascarar 1\" x 40m",
    description:
      "Cinta de papel crepé para enmascarar bordes en pintura. Adhesivo de fácil retiro sin dejar residuo.",
    price: 6500,
    stock: 75,
    minStock: 15,
    categorySlug: "pinturas",
    specs: {
      Ancho: '1" (25 mm)',
      Longitud: "40 m",
      Material: "Papel crepé",
      "Retiro": "Limpio sin residuo",
    },
  },
] as const;

// Sanity checks usados por el orquestador en tiempo de seed.
export const expected = {
  total: 50,
  featured: 8,
  belowMinStock: 6,
} as const;
