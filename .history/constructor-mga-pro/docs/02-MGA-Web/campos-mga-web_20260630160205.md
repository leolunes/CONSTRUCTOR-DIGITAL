CAMPOS MGA WEB
ESPECIFICACIÓN TÉCNICA
CONSTRUCTOR MGA PRO

===========================================================
OBJETIVO
===========================================================

Este documento define la especificación funcional de todos los
campos que requiere la MGA Web y cómo serán generados,
administrados y validados dentro del Constructor MGA Pro.

El propósito es que ningún dato de la MGA Web quede sin un
origen claramente definido dentro de la plataforma.

Cada campo deberá documentarse utilizando una estructura
estándar que permita conocer:

• Nombre oficial del campo.
• Descripción.
• Obligatoriedad.
• Tipo de dato.
• Fuente dentro del Constructor MGA Pro.
• Motor responsable.
• Estado de implementación.
• Nivel de inteligencia.
• Validaciones.
• Dependencias.
• Módulos que lo utilizan.
• Observaciones.

===========================================================
PLANTILLA OFICIAL PARA CADA CAMPO
===========================================================

Nombre oficial del campo

Descripción

Obligatorio:
Sí / No

Tipo de dato:
Texto / Número / Fecha / Lista / Booleano

Longitud:
Según las reglas de la MGA Web.

Grupo:
Identificación
Problemática
Objetivos
Alternativas
Cadena de Valor
Costos
Financiación
Cronograma
Riesgos
Documentos

Fuente dentro del Constructor MGA Pro

Módulo

Motor responsable

Estado de implementación

🟢 Completo
🟡 Parcial
🔴 Pendiente

Nivel de inteligencia

Nivel 1
Ingresado por el usuario.

Nivel 2
Sugerido por el Copiloto.

Nivel 3
Generado automáticamente por el Motor Inteligente.

Nivel 4
Generado y validado automáticamente.

Validaciones

Dependencias

Utilizado por

Observaciones

===========================================================
GRUPOS DE CAMPOS
===========================================================

1. IDENTIFICACIÓN

Incluye:

- Nombre del proyecto
- Entidad formuladora
- Entidad ejecutora
- Sector
- Programa
- Producto
- Localización
- Horizonte
- Vigencias
- BPIN
- Estado del proyecto

-----------------------------------------------------------

2. PROBLEMÁTICA

Incluye:

- Diagnóstico
- Problema central
- Magnitud
- Causas directas
- Causas indirectas
- Efectos directos
- Efectos indirectos
- Población afectada

-----------------------------------------------------------

3. OBJETIVOS

Incluye:

- Objetivo general
- Objetivos específicos
- Medios
- Fines
- Árbol de objetivos

-----------------------------------------------------------

4. ALTERNATIVAS

Incluye:

- Alternativas evaluadas
- Alternativa seleccionada
- Justificación
- Análisis técnico
- Análisis económico
- Análisis ambiental
- Análisis social

-----------------------------------------------------------

5. CADENA DE VALOR

Incluye:

- Productos
- Actividades
- Metas
- Indicadores
- Insumos
- Costos asociados

-----------------------------------------------------------

6. COSTOS

Incluye:

- Presupuesto
- APUs
- Capítulos
- Costos directos
- Costos indirectos
- Operación
- Mantenimiento
- Costos por vigencia

-----------------------------------------------------------

7. FUENTES DE FINANCIACIÓN

Incluye:

- Recursos propios
- Nación
- Departamento
- Municipio
- SGP
- SGR
- Cofinanciación

-----------------------------------------------------------

8. CRONOGRAMA

Incluye:

- Actividades
- Duración
- Inicio
- Finalización
- Programación física
- Programación financiera

-----------------------------------------------------------

9. RIESGOS

Incluye:

- Riesgo
- Tipo
- Probabilidad
- Impacto
- Nivel
- Mitigación
- Responsable

-----------------------------------------------------------

10. DOCUMENTOS

Incluye:

- Diagnóstico
- Justificación
- Estudios
- Planos
- Certificados
- Presupuesto
- APUs
- Anexos
- Soportes

===========================================================
ESTADOS DE IMPLEMENTACIÓN
===========================================================

🟢 COMPLETO
El Constructor MGA Pro genera y valida el campo.

🟡 PARCIAL
Existe información, pero requiere ajustes o integración.

🔴 PENDIENTE
Todavía no existe dentro de la plataforma.

===========================================================
NIVELES DE INTELIGENCIA
===========================================================

Nivel 1
Ingreso manual.

Nivel 2
Sugerencia del Copiloto.

Nivel 3
Generación automática.

Nivel 4
Generación + validación automática.

La meta del proyecto es que la mayoría de los campos lleguen
al Nivel 4.

===========================================================
REGLA DE ORO
===========================================================

Todo nuevo desarrollo dentro del Constructor MGA Pro deberá
estar relacionado con uno o varios campos documentados en este
archivo.

Antes de crear un nuevo módulo se deberá responder:

1. ¿Qué campo(s) de la MGA Web atiende?
2. ¿Qué motor los genera?
3. ¿Qué módulo los administra?
4. ¿Cómo se validan?
5. ¿Cuál es su nivel de inteligencia?

===========================================================
OBJETIVO FINAL
===========================================================

Lograr que el Constructor MGA Pro genere y valide el 100 % de la
información necesaria para diligenciar la MGA Web, manteniendo
coherencia técnica entre la formulación, el presupuesto, los
documentos y los componentes metodológicos.
