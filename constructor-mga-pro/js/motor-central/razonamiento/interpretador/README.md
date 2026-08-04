# Subsistema Interpretador

## Propósito

El subsistema Interpretador constituye la primera capa del Kernel de Inteligencia del Constructor MGA Pro.

Su responsabilidad es transformar una descripción escrita por el formulador en un modelo estructurado que pueda ser entendido por el resto del sistema.

El Interpretador no formula proyectos.

El Interpretador comprende proyectos.

---

# Objetivo

Convertir lenguaje natural en información estructurada y técnicamente utilizable.

---

# Arquitectura

```text
interpretador/
│
├── README.md
├── normalizador.js
├── tokenizador.js
├── extractor-entidades.js
├── clasificador-intencion.js
├── analizador-contexto.js
├── constructor-modelo.js
└── interpretador.js
```

---

# Flujo

```text
Texto del usuario
        ↓
Normalizador
        ↓
Tokenizador
        ↓
Extractor de entidades
        ↓
Clasificador de intención
        ↓
Analizador de contexto
        ↓
Constructor del modelo
        ↓
Interpretador
        ↓
Project Core
```

---

# Componentes

## normalizador.js

Normaliza el texto.

Funciones:

- eliminar espacios repetidos;
- convertir a minúsculas;
- eliminar caracteres innecesarios;
- unificar escritura.

---

## tokenizador.js

Divide el texto en unidades significativas.

Ejemplo:

Construcción de un Centro Vida

↓

["construcción","centro","vida"]

---

## extractor-entidades.js

Identifica entidades como:

- acción;
- infraestructura;
- municipio;
- departamento;
- población;
- institución;
- programa.

---

## clasificador-intencion.js

Determina qué pretende hacer el usuario.

Ejemplos:

- construir;
- ampliar;
- mejorar;
- optimizar;
- rehabilitar;
- fortalecer;
- dotar.

---

## analizador-contexto.js

Analiza:

- dónde;
- para quién;
- por qué;
- necesidad pública;
- sector probable.

---

## constructor-modelo.js

Construye el primer modelo técnico del proyecto.

Incluye:

- idea;
- identificación;
- sector sugerido;
- tipología;
- producto MGA;
- nivel de confianza.

---

## interpretador.js

Coordina todos los componentes anteriores y entrega un único resultado al Project Core.

---

# Integración

El Interpretador será utilizado por:

- Maestro MGA.
- Motor de Razonamiento.
- Motor de Conocimiento.
- Motor de Decisiones.

---

# Estado

Documento base del subsistema Interpretador del Kernel del Constructor MGA Pro.
