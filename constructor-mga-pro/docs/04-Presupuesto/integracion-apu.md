# INTEGRACIÓN APU
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación:
# docs/04-Presupuesto/integracion-apu.md

============================================================
1. PROPÓSITO
============================================================

Este documento define cómo el Constructor MGA Pro integra el motor
heredado de Presupuesto Pro dentro de la formulación de proyectos.

El objetivo es que el presupuesto deje de ser un módulo aislado y se
convierta en el soporte técnico y económico de la MGA.

============================================================
2. PRINCIPIO DE INTEGRACIÓN
============================================================

Cada APU representa la justificación técnica de un costo.

Cada ítem del presupuesto debe poder relacionarse con:

• Un producto MGA.
• Una actividad de la cadena de valor.
• Una meta.
• Una fuente de financiación.
• Un cronograma.

============================================================
3. ESTRUCTURA GENERAL
============================================================

Base Presupuestal

↓

Capítulos

↓

Ítems

↓

APUs

↓

Insumos

↓

Subproductos

↓

Costos

↓

Presupuesto del Proyecto

============================================================
4. COMPONENTES PRINCIPALES
============================================================

Base Presupuestal

- Catálogo maestro.
- APUs oficiales.
- Insumos.
- Subproductos.

Proyecto

- Capítulos propios.
- Ítems seleccionados.
- Cantidades.
- Precios.
- APUs editables.

============================================================
5. OBJETO PRESUPUESTO
============================================================

El presupuesto del proyecto debe contener:

• Capítulos.
• Ítems.
• APUs.
• Insumos.
• Subproductos.
• Costos directos.
• Administración.
• Imprevistos.
• Utilidad.
• IVA.
• Costos indirectos.
• Valor total.

============================================================
6. REGLAS
============================================================

1. La base oficial nunca se modifica.
2. Cada proyecto trabaja sobre una copia.
3. Los APUs pueden personalizarse por proyecto.
4. Todo cambio debe conservar trazabilidad.
5. Debe mantenerse compatibilidad con PDFs y Excel.

============================================================
7. RELACIÓN CON LA MGA
============================================================

El presupuesto debe responder:

¿Qué cuesta cada actividad del proyecto?

Relación esperada:

Actividad MGA

↓

Ítem Presupuestal

↓

APU

↓

Insumos

↓

Costo

============================================================
8. DOCUMENTOS GENERADOS
============================================================

El motor debe soportar:

• PDF Presupuesto.
• PDF APUs.
• PDF Resumen.
• PDF Distribución.
• PDF Cantidad de Recursos.
• PDF Materiales.
• Excel.
• JSON.

============================================================
9. ESTADO ACTUAL
============================================================

Actualmente ya se dispone de:

✓ Banco de APUs.
✓ Subproductos.
✓ PDFs.
✓ Excel.
✓ Costos indirectos.
✓ IVA.
✓ Auditoría.
✓ Copia por proyecto.

============================================================
10. OBJETIVO FINAL
============================================================

Convertir el presupuesto en el soporte económico integrado de toda la
formulación MGA, manteniendo una única fuente de información para costos,
documentos y futura integración con la MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================
