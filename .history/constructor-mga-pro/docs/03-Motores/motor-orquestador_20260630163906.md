# MOTOR ORQUESTADOR
# CONSTRUCTOR MGA PRO
# Versión 1.0
# Ubicación:
# docs/03-Motores/motor-orquestador.md

============================================================
1. PROPÓSITO
============================================================

El Motor Orquestador es el núcleo de coordinación del Constructor MGA Pro.

No reemplaza a los demás motores ni genera contenido por sí solo.

Su función es decidir qué motor debe ejecutarse, en qué momento,
con qué información y en qué orden para construir un proyecto
integral y consistente.

Puede entenderse como el director de orquesta de toda la plataforma.

============================================================
2. MISIÓN
============================================================

Coordinar la interacción entre todos los motores inteligentes para
transformar una idea inicial en un proyecto de inversión pública
estructurado, validado y listo para ser revisado por el usuario.

============================================================
3. RESPONSABILIDADES
============================================================

• Recibir la solicitud del usuario o del Copiloto.
• Identificar el tipo de operación solicitada.
• Determinar qué motores deben intervenir.
• Ejecutar los motores en el orden correcto.
• Consolidar los resultados.
• Detectar errores de ejecución.
• Solicitar información adicional cuando sea necesario.
• Entregar un paquete único de resultados.
• Registrar el proceso en la Memoria Inteligente.

============================================================
4. ENTRADAS
============================================================

Puede recibir información desde:

- Copiloto.
- Formularios.
- Proyecto existente.
- Banco de proyectos.
- Importación JSON.
- Futuras integraciones.

============================================================
5. MOTORES QUE COORDINA
============================================================

• Motor de Conocimiento.
• Motor de Análisis.
• Motor Generador.
• Motor de Coherencia.
• Motor de Autocompletado.
• Motor de Riesgos.
• Motor de Indicadores.
• Motor de Documentos.
• Motor de Financiación.
• Inspector MGA.

============================================================
6. FLUJO PRINCIPAL
============================================================

1. Recibe la idea.

↓

2. Ejecuta Motor de Análisis.

↓

3. Consulta Motor de Conocimiento.

↓

4. Ejecuta Motor Generador.

↓

5. Solicita revisión al Motor de Coherencia.

↓

6. Consolida resultados.

↓

7. Ejecuta Motor de Autocompletado.

↓

8. Actualiza Memoria Inteligente.

↓

9. Informa al Copiloto.

============================================================
7. TIPOS DE OPERACIONES
============================================================

El Orquestador podrá ejecutar procesos como:

• Crear proyecto.
• Completar proyecto.
• Mejorar diagnóstico.
• Generar indicadores.
• Generar riesgos.
• Construir cadena de valor.
• Elaborar documentos.
• Revisar coherencia.
• Preparar exportación MGA Web.

============================================================
8. SALIDAS
============================================================

Entrega un paquete integral que puede incluir:

- Diagnóstico.
- Objetivos.
- Indicadores.
- Riesgos.
- Cadena de valor.
- Presupuesto preliminar.
- Documentos.
- Estado de coherencia.
- Recomendaciones.
- Próximo paso sugerido.

============================================================
9. MANEJO DE ERRORES
============================================================

El Orquestador debe identificar:

• Información insuficiente.
• Conflictos entre motores.
• Datos contradictorios.
• Tipología no identificada.
• Catálogos inexistentes.
• Validaciones fallidas.

Ante estos casos debe:

1. Registrar el evento.
2. Informar al Copiloto.
3. Solicitar información adicional.
4. Evitar modificaciones incompletas del proyecto.

============================================================
10. RELACIÓN CON EL PROYECTO
============================================================

El Orquestador nunca debe escribir directamente sobre el proyecto.

Toda actualización debe realizarse mediante el
Motor de Autocompletado, garantizando una única fuente de verdad.

============================================================
11. RELACIÓN CON EL COPILOTO
============================================================

El Copiloto es la interfaz conversacional.

El Orquestador es el cerebro que coordina el trabajo interno.

El flujo correcto es:

Usuario

↓

Copiloto

↓

Motor Orquestador

↓

Motores Especializados

↓

Autocompletado

↓

Proyecto

↓

Respuesta al usuario

============================================================
12. EVOLUCIÓN PREVISTA
============================================================

Versión 1:
Coordinación básica de motores.

Versión 2:
Procesos paralelos.

Versión 3:
Priorización inteligente de tareas.

Versión 4:
Planificación adaptativa según el estado del proyecto.

============================================================
13. REGLAS
============================================================

1. No duplicar llamadas innecesarias.
2. Mantener trazabilidad de cada ejecución.
3. Registrar tiempos y resultados.
4. Garantizar consistencia antes del autocompletado.
5. Centralizar la coordinación de todos los motores.

============================================================
14. OBJETIVO FINAL
============================================================

Convertirse en el núcleo operativo del Constructor MGA Pro,
garantizando que todos los motores trabajen de manera coordinada,
ordenada y trazable para producir proyectos completos, coherentes y
preparados para la MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================
