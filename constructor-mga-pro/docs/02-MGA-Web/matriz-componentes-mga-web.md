# MATRIZ DE COMPONENTES MGA WEB
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación:
# docs/02-MGA-Web/matriz-componentes-mga-web.md

============================================================
OBJETIVO
============================================================

Esta matriz es el inventario maestro de los componentes que exige la
MGA Web y el mecanismo oficial para medir la cobertura del
Constructor MGA Pro.

Cada componente identifica:

- Grupo metodológico.
- Componente.
- Estado de implementación.
- Prioridad.
- Módulo responsable.
- Motor responsable.
- Nivel de inteligencia.
- Observaciones.

============================================================
ESTADOS
============================================================

🟢 Completo
🟡 Parcial
🔴 Pendiente

============================================================
NIVELES DE INTELIGENCIA
============================================================

Nivel 1  Manual
Nivel 2  Sugerido por Copiloto
Nivel 3  Generado automáticamente
Nivel 4  Generado y validado automáticamente

============================================================
MATRIZ GENERAL
============================================================

| Grupo | Componente | Estado | Prioridad | Módulo | Motor | Nivel |
|-------|------------|--------|-----------|--------|--------|-------|
| Identificación | Nombre del proyecto | 🟢 | Muy Alta | Datos Básicos | Orquestador | 3 |
| Identificación | Entidad formuladora | 🟢 | Muy Alta | Datos Básicos | Usuario | 1 |
| Identificación | Entidad ejecutora | 🟡 | Alta | Datos Básicos | Copiloto | 2 |
| Identificación | Sector | 🟢 | Muy Alta | Identificación MGA | Análisis | 3 |
| Identificación | Programa | 🔴 | Muy Alta | Identificación MGA | Conocimiento | 3 |
| Identificación | Producto MGA | 🟡 | Muy Alta | Identificación MGA | Conocimiento | 3 |
| Identificación | Localización | 🟡 | Alta | Identificación MGA | Análisis | 3 |
| Identificación | Horizonte | 🔴 | Alta | Identificación MGA | Orquestador | 3 |
| Identificación | Vigencias | 🔴 | Alta | Identificación MGA | Orquestador | 3 |
| Política Pública | PND | 🔴 | Muy Alta | Política Pública | Conocimiento | 3 |
| Política Pública | Plan Departamental | 🔴 | Alta | Política Pública | Conocimiento | 3 |
| Política Pública | Plan Municipal | 🔴 | Alta | Política Pública | Conocimiento | 3 |
| Problemática | Diagnóstico | 🟢 | Muy Alta | Diagnóstico | Generador | 3 |
| Problemática | Problema central | 🟢 | Muy Alta | Diagnóstico | Generador | 3 |
| Problemática | Magnitud | 🟡 | Alta | Diagnóstico | Generador | 3 |
| Problemática | Árbol de problemas | 🟢 | Muy Alta | Árbol Problemas | Generador | 3 |
| Población | Población afectada | 🟡 | Muy Alta | Población | Análisis | 3 |
| Población | Población objetivo | 🟡 | Muy Alta | Población | Análisis | 3 |
| Participantes | Actores | 🔴 | Alta | Participantes | Conocimiento | 3 |
| Objetivos | Objetivo general | 🟢 | Muy Alta | Árbol Objetivos | Generador | 3 |
| Objetivos | Objetivos específicos | 🟢 | Muy Alta | Árbol Objetivos | Generador | 3 |
| Alternativas | Alternativas | 🔴 | Muy Alta | Alternativas | Generador | 3 |
| Cadena de Valor | Productos | 🟡 | Muy Alta | Cadena de Valor | Orquestador | 3 |
| Cadena de Valor | Actividades | 🟡 | Muy Alta | Cadena de Valor | Orquestador | 3 |
| Cadena de Valor | Metas | 🔴 | Muy Alta | Cadena de Valor | Orquestador | 3 |
| Indicadores | Indicadores producto | 🟡 | Muy Alta | Indicadores | Indicadores | 3 |
| Indicadores | Línea base | 🔴 | Alta | Indicadores | Indicadores | 3 |
| Riesgos | Matriz de riesgos | 🟢 | Muy Alta | Riesgos | Riesgos | 3 |
| Costos | Presupuesto | 🟢 | Muy Alta | Presupuesto | Presupuesto | 4 |
| Costos | APUs | 🟢 | Muy Alta | APUs | Presupuesto | 4 |
| Costos | Distribución por actividad | 🔴 | Muy Alta | Presupuesto | Puente Presupuesto | 3 |
| Financiación | Fuentes | 🟡 | Muy Alta | Financiación | Financiación | 3 |
| Financiación | Valores por vigencia | 🔴 | Alta | Financiación | Financiación | 3 |
| Cronograma | Programación física | 🟡 | Alta | Cronograma | Orquestador | 3 |
| Cronograma | Programación financiera | 🔴 | Alta | Cronograma | Orquestador | 3 |
| Sostenibilidad | Técnica | 🟡 | Alta | Documentos | Generador | 3 |
| Sostenibilidad | Financiera | 🔴 | Alta | Documentos | Generador | 3 |
| Documentos | Justificación | 🟢 | Muy Alta | Documentos | Documentos | 3 |
| Documentos | Resumen ejecutivo | 🟢 | Alta | Documentos | Documentos | 3 |
| Documentos | Marco lógico | 🟡 | Muy Alta | Documentos | Documentos | 3 |

============================================================
RESUMEN DE COBERTURA (VERSIÓN ACTUAL)
============================================================

Identificación .............. 60 %
Política Pública ............ 0 %
Problemática ............... 90 %
Participantes ............... 0 %
Población .................. 50 %
Objetivos .................. 95 %
Alternativas ............... 10 %
Cadena de Valor ............ 60 %
Indicadores ................. 55 %
Riesgos ..................... 85 %
Costos ...................... 95 %
Financiación ............... 40 %
Cronograma ................. 35 %
Sostenibilidad ............. 30 %
Documentos ................. 80 %

Cobertura funcional estimada: 70 % - 75 %

============================================================
CRITERIOS DE ACTUALIZACIÓN
============================================================

Cada vez que se implemente una nueva funcionalidad deberán actualizarse:

1. Estado.
2. Módulo responsable.
3. Motor responsable.
4. Nivel de inteligencia.
5. Porcentaje de cobertura.

Esta matriz será la referencia oficial para medir cuándo el Constructor
MGA Pro alcanza el objetivo de cubrir el 100 % de los componentes
necesarios para la MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================
