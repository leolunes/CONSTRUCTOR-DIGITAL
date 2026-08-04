# Motor de Razonamiento

## Propósito

El subsistema **Razonamiento** constituye el núcleo analítico del Kernel del Constructor MGA Pro.

Su responsabilidad es transformar la información almacenada en el Project Core en conclusiones técnicas explicables, verificables y trazables.

No genera información por sí solo.

Analiza, relaciona, valida y justifica.

---

# Objetivo

Simular el razonamiento de un formulador profesional de proyectos de inversión pública.

---

# Flujo general

```text
Idea del proyecto
        ↓
Interpretador
        ↓
Clasificador
        ↓
Relaciones
        ↓
Coherencia
        ↓
Confianza
        ↓
Conclusiones
        ↓
Explicaciones
        ↓
Motor de Razonamiento
```

---

# Componentes

## interpretador.js

Comprende el lenguaje del usuario y lo convierte en información estructurada.

---

## clasificador.js

Identifica:

- Sector
- Programa
- Tipología
- Producto MGA
- Naturaleza del proyecto

---

## relaciones.js

Construye las relaciones entre:

- Problema
- Objetivos
- Productos
- Actividades
- Indicadores
- Riesgos
- Presupuesto

---

## coherencia.js

Evalúa la consistencia técnica entre todos los componentes del proyecto.

---

## confianza.js

Calcula el nivel de confianza de cada conclusión.

Niveles:

- Alta
- Media
- Baja

---

## conclusiones.js

Genera las conclusiones técnicas del análisis.

---

## explicaciones.js

Explica el razonamiento utilizado para llegar a cada conclusión.

---

## motor-razonamiento.js

Coordina todos los componentes anteriores y expone la API pública del subsistema.

---

# Principios

- Comprender antes de concluir.
- Relacionar antes de evaluar.
- Justificar antes de recomendar.
- Mantener trazabilidad.
- Utilizar siempre Project Core como fuente de verdad.

---

# Integración

Este subsistema será utilizado por:

- Maestro MGA
- Motor de Calidad
- Motor de Decisiones
- Inspector MGA
- Asesor Experto
- Reporte Ejecutivo

---

# Estado

Documento base del subsistema de Razonamiento del Kernel del Constructor MGA Pro.
