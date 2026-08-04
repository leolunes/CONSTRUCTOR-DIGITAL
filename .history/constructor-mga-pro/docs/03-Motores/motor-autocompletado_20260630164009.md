# MOTOR DE AUTOCOMPLETADO
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación:
# docs/03-Motores/motor-autocompletado.md

============================================================
1. PROPÓSITO
============================================================

El Motor de Autocompletado es el responsable de escribir la información
generada por los motores inteligentes dentro de la estructura oficial
del proyecto.

Es el único motor autorizado para actualizar automáticamente el objeto
Proyecto como resultado de un proceso inteligente.

============================================================
2. MISIÓN
============================================================

Transformar el paquete generado por el Motor Orquestador en información
persistente, organizada y coherente dentro del modelo de datos oficial.

============================================================
3. RESPONSABILIDADES
============================================================

• Actualizar el objeto Proyecto.
• Completar módulos parcialmente vacíos.
• Conservar información existente del usuario.
• Evitar sobrescribir datos confirmados.
• Registrar cambios en el historial.
• Actualizar la Memoria Inteligente.
• Notificar módulos afectados.

============================================================
4. ENTRADAS
============================================================

- Project ID.
- Estructura oficial del proyecto.
- Paquete del Motor Orquestador.
- Configuración del usuario.

============================================================
5. SALIDAS
============================================================

- Proyecto actualizado.
- Historial actualizado.
- Memoria actualizada.
- Estado de cobertura recalculado.
- Eventos de actualización.

============================================================
6. REGLAS PRINCIPALES
============================================================

1. Nunca eliminar información confirmada por el usuario.
2. Respetar la edición manual.
3. Escribir únicamente en la estructura oficial.
4. Mantener consistencia entre módulos.
5. Registrar cada actualización importante.

============================================================
7. ESTRATEGIA DE ACTUALIZACIÓN
============================================================

Cada campo recibido será clasificado como:

• Nuevo.
• Vacío.
• Parcial.
• Confirmado por usuario.

El comportamiento será:

- Nuevo → Crear.
- Vacío → Completar.
- Parcial → Complementar.
- Confirmado → Solicitar confirmación antes de reemplazar.

============================================================
8. MÓDULOS QUE PUEDE ACTUALIZAR
============================================================

• Datos básicos.
• Identificación MGA.
• Diagnóstico.
• Árbol de problemas.
• Árbol de objetivos.
• Participantes.
• Población.
• Alternativas.
• Cadena de valor.
• Indicadores.
• Riesgos.
• Cronograma.
• Documentos.
• Memoria Inteligente.
• Cobertura MGA.

============================================================
9. RELACIÓN CON OTROS MOTORES
============================================================

Recibe información de:

- Motor Orquestador.
- Motor Generador.
- Motor Coherencia.

Actualiza:

- Proyecto.
- Memoria.
- Historial.

Informa a:

- Inspector MGA.
- Copiloto.
- Interfaz de usuario.

============================================================
10. EVENTOS QUE GENERA
============================================================

• Proyecto actualizado.
• Diagnóstico actualizado.
• Indicadores modificados.
• Riesgos modificados.
• Documentos regenerados.
• Cobertura recalculada.

Estos eventos serán utilizados por el futuro Bus de Eventos.

============================================================
11. VALIDACIONES
============================================================

Antes de guardar debe verificar:

• Existencia del proyecto.
• Integridad del modelo de datos.
• Coherencia mínima.
• Compatibilidad con la versión del proyecto.

============================================================
12. EVOLUCIÓN PREVISTA
============================================================

Versión 1:
Actualización básica.

Versión 2:
Actualización diferencial.

Versión 3:
Detección inteligente de conflictos.

Versión 4:
Sincronización automática entre módulos.

============================================================
13. OBJETIVO FINAL
============================================================

Garantizar que toda la información producida por la inteligencia de la
plataforma quede integrada en un único modelo de datos, preservando la
información del usuario y manteniendo la trazabilidad completa de los
cambios realizados.

============================================================
FIN DEL DOCUMENTO
============================================================
