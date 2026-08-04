# INTEGRACIÓN PRESUPUESTO - MGA
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación:
# docs/04-Presupuesto/integracion-presupuesto.md

============================================================
1. PROPÓSITO
============================================================

Este documento define la integración entre la formulación metodológica
(MGA) y el presupuesto del proyecto.

El objetivo es que cada componente metodológico tenga un respaldo
técnico, económico y financiero dentro del Constructor MGA Pro.

============================================================
2. PRINCIPIO FUNDAMENTAL
============================================================

La formulación y el presupuesto constituyen un único sistema.

La MGA responde:

¿Qué se va a hacer?

El Presupuesto responde:

¿Cuánto cuesta hacerlo y cómo se ejecuta?

============================================================
3. MODELO DE INTEGRACIÓN
============================================================

Problema

↓

Objetivo General

↓

Objetivos Específicos

↓

Productos

↓

Actividades

↓

Capítulos

↓

Ítems

↓

APUs

↓

Costos

↓

Fuentes

↓

Cronograma

↓

MGA Web

============================================================
4. RELACIONES PRINCIPALES
============================================================

Cada Producto MGA puede tener:

• Uno o varios capítulos.

Cada Actividad puede tener:

• Uno o varios ítems.

Cada Ítem puede tener:

• Un APU.

Cada APU puede tener:

• Insumos.
• Subproductos.

Cada costo debe poder asociarse a:

• Actividad.
• Producto.
• Vigencia.
• Fuente de financiación.

============================================================
5. MODELO DE DATOS PROPUESTO
============================================================

Producto MGA

↓

Actividad MGA

↓

ItemPresupuesto

↓

APU

↓

CostoDirecto

↓

CostoIndirecto

↓

FuenteFinanciacion

↓

Cronograma

============================================================
6. REGLAS DE NEGOCIO
============================================================

1. Ninguna actividad debe quedar sin costo.

2. Ningún costo debe quedar sin actividad.

3. Todo costo debe pertenecer a un producto.

4. El valor de las fuentes debe coincidir con el valor total.

5. Toda actividad debe poder programarse.

6. Toda modificación presupuestal debe actualizar los indicadores
económicos del proyecto.

============================================================
7. VALIDACIONES
============================================================

El Inspector deberá verificar:

✓ Productos con actividades.

✓ Actividades con presupuesto.

✓ Ítems con APU.

✓ APUs completos.

✓ Fuentes completas.

✓ Cronograma asociado.

✓ Costos consistentes.

============================================================
8. IMPACTO SOBRE LOS DOCUMENTOS
============================================================

Los documentos técnicos podrán incorporar automáticamente:

• Costos por actividad.
• Costos por producto.
• Distribución por fuente.
• Distribución por vigencia.
• Programación financiera.
• Resúmenes económicos.

============================================================
9. IMPACTO SOBRE LA MGA WEB
============================================================

La integración permitirá preparar automáticamente:

• Cadena de valor.
• Costos.
• Fuentes.
• Cronograma.
• Productos.
• Actividades.

============================================================
10. ESTADO ACTUAL
============================================================

Disponible:

✓ Presupuesto.
✓ APUs.
✓ Capítulos.
✓ Ítems.
✓ Costos indirectos.
✓ PDFs.
✓ Excel.

Pendiente:

• Relación Producto ↔ Capítulo.
• Relación Actividad ↔ Ítem.
• Relación Costo ↔ Fuente.
• Relación Actividad ↔ Cronograma.
• Distribución por vigencias.

============================================================
11. OBJETIVO FINAL
============================================================

Lograr que cualquier modificación realizada en la formulación o en el
presupuesto se refleje automáticamente en toda la estructura del
proyecto, garantizando coherencia entre la MGA, los documentos, los
costos y la futura preparación para la MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================