# CATÁLOGO DE PRODUCTOS MGA
# CONSTRUCTOR MGA PRO
# Archivo:
# docs/07-Base-Conocimiento/03-Productos-MGA/productos-mga.md

============================================================
PROPÓSITO
============================================================

Este documento define el catálogo base de Productos MGA que utilizará
el Motor de Conocimiento para construir automáticamente la Cadena de
Valor de un proyecto.

Cada producto deberá poder relacionarse con actividades, indicadores,
presupuesto y cronograma.

============================================================
ESTRUCTURA DEL PRODUCTO
============================================================

Cada producto debe contener:

• Sector.
• Tipología.
• Código (cuando aplique).
• Nombre del producto.
• Descripción.
• Unidad de medida.
• Actividades sugeridas.
• Indicadores asociados.
• Riesgos relacionados.
• Observaciones técnicas.

============================================================
EJEMPLO 1
============================================================

Sector

Transporte

Tipología

Placa huella

Producto

Placa huella construida.

Unidad

Metros lineales.

Actividades

• Estudios y diseños.
• Localización y replanteo.
• Movimiento de tierras.
• Construcción de placa huella.
• Obras de drenaje.
• Señalización.
• Interventoría.

Indicadores

• Metros lineales construidos.
• % de avance físico.

============================================================
EJEMPLO 2
============================================================

Sector

Agua Potable

Tipología

Optimización de acueducto

Producto

Sistema de acueducto optimizado.

Unidad

Sistema.

Actividades

• Estudios.
• Redes.
• Tanques.
• Equipos.
• Pruebas.
• Puesta en marcha.

============================================================
RELACIONES
============================================================

Producto MGA

↓

Actividades

↓

Ítems Presupuestales

↓

APUs

↓

Costos

↓

Cronograma

↓

Indicadores

============================================================
REGLAS
============================================================

1. Todo producto debe tener al menos una actividad.
2. Toda actividad debe poder asociarse a presupuesto.
3. Todo producto debe tener un indicador principal.
4. El producto debe ser reutilizable por distintas tipologías cuando
   corresponda.

============================================================
OBJETIVO FINAL
============================================================

Construir un catálogo reutilizable de productos que permita generar
automáticamente la Cadena de Valor y conectar la formulación con el
presupuesto del proyecto.

============================================================
FIN DEL DOCUMENTO
============================================================
