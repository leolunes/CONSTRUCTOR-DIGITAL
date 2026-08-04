# MOTOR DE COHERENCIA
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación:
# docs/03-Motores/motor-coherencia.md

============================================================
1. PROPÓSITO
============================================================

El Motor de Coherencia verifica que todos los componentes del proyecto
mantengan consistencia lógica, técnica y metodológica.

No genera contenido nuevo.

Su misión es detectar inconsistencias antes de que el proyecto sea
consolidado o exportado hacia la MGA Web.

============================================================
2. RESPONSABILIDADES
============================================================

• Validar relaciones entre módulos.
• Detectar contradicciones.
• Revisar dependencias.
• Emitir advertencias.
• Calcular un puntaje de coherencia.
• Proponer correcciones.

============================================================
3. ENTRADAS
============================================================

- Estructura oficial del proyecto.
- Resultado del Motor Generador.
- Presupuesto.
- Cadena de valor.
- Indicadores.
- Riesgos.
- Documentos.

============================================================
4. SALIDAS
============================================================

- Lista de errores.
- Lista de advertencias.
- Recomendaciones.
- Puntaje de coherencia.
- Estado del proyecto.

============================================================
5. VALIDACIONES PRINCIPALES
============================================================

Debe verificar, entre otras:

• Problema ↔ Objetivo general.
• Objetivos ↔ Productos.
• Productos ↔ Actividades.
• Actividades ↔ Presupuesto.
• Actividades ↔ Cronograma.
• Productos ↔ Indicadores.
• Riesgos ↔ Actividades.
• Costos ↔ Fuentes.
• Documentos ↔ Datos del proyecto.

============================================================
6. NIVELES DE SEVERIDAD
============================================================

Crítico:
Impide continuar.

Alto:
Debe corregirse antes de radicar.

Medio:
Afecta la calidad técnica.

Bajo:
Recomendación de mejora.

============================================================
7. REGLAS
============================================================

1. Nunca modifica automáticamente la información.
2. Todas las observaciones deben ser explicadas.
3. Debe indicar el módulo donde ocurre el problema.
4. Debe sugerir la acción correctiva.

============================================================
8. RELACIÓN CON OTROS MOTORES
============================================================

Recibe información de:

- Motor Generador.
- Motor Orquestador.
- Motor Autocompletado.

Entrega información a:

- Inspector MGA.
- Copiloto.
- Memoria Inteligente.

============================================================
9. EJEMPLOS DE VALIDACIÓN
============================================================

✓ Objetivo sin problema asociado.

✓ Actividad sin costo.

✓ Producto sin indicador.

✓ Indicador sin línea base.

✓ Fuente de financiación insuficiente.

✓ Cronograma sin actividades.

✓ Documento generado con información desactualizada.

============================================================
10. EVOLUCIÓN PREVISTA
============================================================

Versión 1:
Validaciones básicas.

Versión 2:
Reglas por sector.

Versión 3:
Puntaje global de calidad.

Versión 4:
Aprendizaje de patrones de error.

============================================================
11. OBJETIVO FINAL
============================================================

Garantizar que cada proyecto conserve coherencia metodológica antes
de generar documentos, exportaciones o preparación para la MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================
