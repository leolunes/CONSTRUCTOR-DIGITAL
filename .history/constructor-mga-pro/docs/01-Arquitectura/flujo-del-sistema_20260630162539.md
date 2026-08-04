# FLUJO DEL SISTEMA
# CONSTRUCTOR MGA PRO
# Plataforma Inteligente de Formulación de Proyectos de Inversión Pública
# Versión 1.0
# Ubicación sugerida:
# docs/01-Arquitectura/flujo-del-sistema.md

============================================================
1. OBJETIVO DEL DOCUMENTO
============================================================

Este documento describe el flujo completo de información dentro del
Constructor MGA Pro.

Su propósito es explicar qué ocurre desde que el usuario crea o abre un
proyecto hasta que la información queda lista para ser usada en la MGA
Web, documentos técnicos, presupuesto, PDF, Excel o backup.

Este flujo será la referencia para integrar los módulos actuales y los
futuros desarrollos.

============================================================
2. FLUJO GENERAL RESUMIDO
============================================================

USUARIO

↓

BANCO DE PROYECTOS

↓

PROYECTO ACTIVO

↓

IDEA DEL PROYECTO

↓

COPILOTO / ASISTENTE

↓

MOTOR DE ANÁLISIS

↓

MOTOR DE CONOCIMIENTO

↓

MOTOR GENERADOR

↓

MOTOR ORQUESTADOR

↓

MOTOR DE AUTOCOMPLETADO

↓

ESTRUCTURA OFICIAL DEL PROYECTO

↓

MÓDULOS MGA + PRESUPUESTO + DOCUMENTOS

↓

INSPECTOR MGA WEB

↓

EXPORTACIÓN / COPIA / RADICACIÓN

============================================================
3. ETAPA 1: INGRESO AL SISTEMA
============================================================

El usuario ingresa a la aplicación.

Pantalla principal:

- proyectos.html

Funciones principales:

- Crear proyecto.
- Abrir proyecto.
- Importar proyecto.
- Exportar backup.
- Instalar base APU.
- Ver banco de proyectos.
- Ver estado de presupuesto y base APU.

Resultado esperado:

El usuario selecciona o crea un proyecto que se convierte en el
proyecto activo.

============================================================
4. ETAPA 2: PROYECTO ACTIVO
============================================================

Al abrir un proyecto, el sistema carga:

- Datos básicos.
- Presupuesto.
- APUs.
- Capítulos.
- Ítems.
- Diagnóstico MGA.
- Árboles.
- Indicadores.
- Riesgos.
- Documentos.
- Memoria inteligente.
- Historial.
- Cobertura MGA Web.

Pantalla principal:

- proyecto-detalle.html

Esta pantalla actúa como centro de control del proyecto.

============================================================
5. ETAPA 3: IDEA DEL PROYECTO
============================================================

El usuario puede iniciar el proceso mediante:

1. Formulario manual.
2. Asistente de Tipologías.
3. Copiloto Orquestador.

Ejemplo de idea:

"Construcción de placa huella de 2 km para la vereda El Diamante
beneficiando a 320 personas."

La idea es la entrada principal para los motores inteligentes.

============================================================
6. ETAPA 4: COPILOTO INTELIGENTE
============================================================

El Copiloto recibe la idea y cumple estas funciones:

1. Solicita información mínima.
2. Interpreta la necesidad del usuario.
3. Envía la idea al Motor Orquestador.
4. Presenta resultados.
5. Permite autocompletar el proyecto.
6. Recomienda el siguiente paso.

Entradas:

- Idea del proyecto.
- Ubicación.
- Beneficiarios.
- Alcance físico.
- Datos complementarios del usuario.

Salidas:

- Proyecto preliminar.
- Sector.
- Tipología.
- Problema.
- Objetivo.
- Indicadores.
- Riesgos.
- Fuentes.
- Presupuesto preliminar.
- Recomendación siguiente.

============================================================
7. ETAPA 5: MOTOR DE ANÁLISIS
============================================================

El Motor de Análisis procesa la idea del usuario.

Funciones:

- Normalizar texto.
- Identificar palabras clave.
- Detectar sector probable.
- Detectar tipología probable.
- Extraer ubicación.
- Extraer beneficiarios.
- Extraer longitud o alcance.
- Detectar tipo de intervención.

Entradas:

- Texto libre del usuario.

Salidas:

- Sector.
- Tipología.
- Confianza.
- Datos detectados.
- Sugerencias.

============================================================
8. ETAPA 6: MOTOR DE CONOCIMIENTO
============================================================

El Motor de Conocimiento consulta la base técnica del sistema.

Funciones:

- Buscar tipologías.
- Obtener productos.
- Obtener actividades.
- Obtener indicadores.
- Obtener riesgos.
- Obtener fuentes.
- Obtener normatividad.
- Construir estructura base.

Entradas:

- Sector.
- Tipología.
- Palabras clave.

Salidas:

- Estructura técnica del proyecto.
- Componentes MGA sugeridos.
- Catálogos relacionados.

============================================================
9. ETAPA 7: MOTOR GENERADOR
============================================================

El Motor Generador construye contenido técnico.

Funciones:

- Generar problema central.
- Generar objetivo general.
- Generar justificación.
- Generar descripción.
- Generar beneficios.
- Generar sostenibilidad.
- Generar resumen ejecutivo inicial.
- Generar estructura MGA base.

Entradas:

- Tipología.
- Datos detectados.
- Catálogos.
- Información del proyecto.

Salidas:

- Textos técnicos.
- Problema.
- Objetivos.
- Cadena de valor preliminar.
- Documentos base.

============================================================
10. ETAPA 8: MOTOR ORQUESTADOR
============================================================

El Motor Orquestador coordina todos los motores.

Funciones:

1. Recibe la idea.
2. Llama al Motor de Análisis.
3. Llama al Motor Generador.
4. Llama al Motor de Financiación.
5. Llama al Motor de Riesgos.
6. Llama al Motor de Indicadores.
7. Llama al Motor de Documentos.
8. Genera presupuesto preliminar.
9. Valida coherencia.
10. Devuelve un paquete integral.

Entrada:

- Idea del proyecto.
- Datos adicionales del usuario.

Salida:

- Paquete integral del proyecto.

El Orquestador es el director de todo el proceso inteligente.

============================================================
11. ETAPA 9: MOTOR DE AUTOCOMPLETADO
============================================================

El Motor de Autocompletado toma el paquete del Orquestador y lo
convierte en datos del proyecto.

Funciones:

- Crear formulación MGA.
- Crear memoria inteligente.
- Crear historial inteligente.
- Guardar diagnóstico.
- Guardar árboles.
- Guardar cadena de valor.
- Guardar indicadores.
- Guardar riesgos.
- Guardar fuentes.
- Guardar documentos.
- Guardar presupuesto preliminar.
- Mantener compatibilidad con módulos existentes.

Entrada:

- projectId.
- Paquete del Orquestador.

Salida:

- Proyecto actualizado.

Regla importante:

El Autocompletado no debe borrar presupuesto ni APUs existentes.

============================================================
12. ETAPA 10: ESTRUCTURA OFICIAL DEL PROYECTO
============================================================

Después del autocompletado, la información debe vivir en la estructura
oficial del proyecto.

Ejemplo:

project.diagnosticoMGA
project.arbolProblemasMGA
project.arbolObjetivosMGA
project.cadenaValorMGA
project.indicadoresMGA
project.riesgosMGA
project.fuentesFinanciacionMGA
project.documentosMGA
project.presupuestoPreliminarMGA
project.memoriaInteligente
project.historialInteligente

Esta estructura debe convertirse en la fuente única de verdad.

============================================================
13. ETAPA 11: MÓDULOS MGA
============================================================

Los módulos MGA leen la estructura oficial del proyecto.

Módulos:

- Diagnóstico.
- Árbol de Problemas.
- Árbol de Objetivos.
- Cadena de Valor.
- Indicadores.
- Riesgos.
- Cronograma.
- Documentos MGA.

Cada módulo debe permitir:

1. Ver información generada.
2. Editar manualmente.
3. Guardar cambios.
4. Notificar al sistema.
5. Actualizar memoria e inspector.

============================================================
14. ETAPA 12: MOTOR PRESUPUESTAL
============================================================

El presupuesto funciona como soporte técnico y financiero.

Componentes:

- Capítulos.
- Ítems.
- APUs.
- Insumos.
- Subproductos.
- Costos directos.
- Costos indirectos.
- Totales.
- PDF.
- Excel.

Flujo presupuestal:

Base APU

↓

Búsqueda de ítems

↓

Selección

↓

Cantidad

↓

Capítulo

↓

Presupuesto

↓

APU

↓

Costo total

↓

Documentos / MGA

El objetivo futuro es conectar actividades MGA con ítems de presupuesto.

============================================================
15. ETAPA 13: PUENTE PRESUPUESTO - MGA
============================================================

Este puente será un componente clave.

Debe permitir:

- Asociar producto MGA con capítulos.
- Asociar actividad MGA con ítems.
- Asociar actividad con costo.
- Asociar insumos con actividad.
- Distribuir costos por vigencia.
- Relacionar fuentes con costos.

Flujo esperado:

Producto MGA

↓

Actividad MGA

↓

Ítems de presupuesto

↓

APUs

↓

Costo

↓

Fuente

↓

Vigencia

Este puente aún debe desarrollarse.

============================================================
16. ETAPA 14: MOTOR DOCUMENTAL
============================================================

El Motor Documental genera salidas técnicas.

Documentos:

- Diagnóstico.
- Justificación.
- Resumen ejecutivo.
- Marco lógico.
- Sostenibilidad.
- Beneficios.
- Especificaciones técnicas.
- PDF presupuesto.
- PDF APUs.
- Excel.
- Soportes.

Regla:

Los documentos deben generarse desde datos reales del proyecto, no desde
textos aislados.

============================================================
17. ETAPA 15: MEMORIA INTELIGENTE
============================================================

La Memoria Inteligente resume el estado del proyecto.

Debe conservar:

- Sector.
- Tipología.
- Problema.
- Objetivo.
- Estado de avance.
- Próximo paso.
- Recomendaciones.
- Últimas acciones.
- Cobertura MGA Web.

Ejemplo:

"El proyecto tiene diagnóstico, objetivos, riesgos e indicadores.
Falta completar población, fuentes por vigencia y costos por actividad."

============================================================
18. ETAPA 16: HISTORIAL INTELIGENTE
============================================================

El Historial registra cambios y decisiones.

Debe guardar:

- Fecha.
- Tipo de acción.
- Módulo.
- Descripción.
- Usuario.
- Cambios.
- Resultado.

Ejemplos:

- Copiloto generó estructura inicial.
- Usuario modificó objetivo general.
- Inspector detectó indicador sin línea base.
- Se actualizó presupuesto.

============================================================
19. ETAPA 17: INSPECTOR MGA WEB
============================================================

El Inspector validará si el proyecto está listo para MGA Web.

Debe revisar:

- Campos completos.
- Campos parciales.
- Campos pendientes.
- Coherencia problema-objetivo.
- Productos sin actividades.
- Actividades sin costos.
- Indicadores sin línea base.
- Riesgos incompletos.
- Fuentes que no suman al valor total.
- Cronograma vacío.
- Documentos faltantes.

Salida esperada:

- Porcentaje de cobertura.
- Errores críticos.
- Advertencias.
- Recomendaciones.
- Estado listo/no listo.

============================================================
20. ETAPA 18: MAPA MGA WEB
============================================================

El Mapa MGA Web conectará la estructura interna con la MGA Web.

Para cada campo indicará:

- Grupo.
- Campo.
- Módulo.
- Fuente.
- Motor.
- Estado.
- Reglas.
- Validaciones.
- Acción pendiente.

Este mapa permitirá saber qué información ya está lista para copiar o
exportar hacia MGA Web.

============================================================
21. ETAPA 19: EXPORTACIONES
============================================================

La plataforma debe permitir exportar:

- PDF.
- PDF Presupuesto.
- PDF APUs.
- PDF Especificaciones.
- Excel.
- JSON.
- Backup.
- Ficha para MGA Web.
- Documentos técnicos.

Cada exportación debe leer la estructura oficial del proyecto.

============================================================
22. ETAPA 20: CICLO DE RETROALIMENTACIÓN
============================================================

Cuando el usuario modifica un dato, el sistema debe actualizar los
componentes relacionados.

Ejemplo:

Si cambia el problema central:

- Se debe revisar el objetivo general.
- Se debe revisar el diagnóstico.
- Se debe revisar el árbol de problemas.
- Se debe revisar el árbol de objetivos.
- Se debe actualizar memoria.
- Se debe actualizar inspector.

Este ciclo será gestionado en el futuro por un Bus de Eventos.

============================================================
23. FLUJO IDEAL FINAL
============================================================

El flujo ideal de la plataforma será:

1. Usuario crea proyecto.
2. Usuario escribe idea.
3. Copiloto interpreta.
4. Orquestador genera estructura.
5. Autocompletado escribe en el proyecto.
6. Usuario revisa y ajusta.
7. Presupuesto se conecta con cadena de valor.
8. Inspector valida.
9. Documentos se generan.
10. Cobertura MGA Web llega al 100%.
11. Proyecto queda listo para radicación.

============================================================
24. REGLAS OPERATIVAS DEL FLUJO
============================================================

1. Todo dato debe pertenecer al proyecto.
2. Ningún motor debe guardar datos aislados sin relación.
3. Todo cambio importante debe quedar en historial.
4. Todo componente debe poder ser validado.
5. Todo documento debe generarse desde datos reales.
6. El presupuesto debe alimentar la cadena de valor.
7. La MGA debe alimentarse del presupuesto y de la formulación.
8. El Copiloto debe recomendar, pero el usuario conserva control final.
9. El Inspector debe alertar antes de radicación.
10. La documentación debe preceder al código.

============================================================
25. ESTADO ACTUAL DEL FLUJO
============================================================

Estado actual:
Parcialmente implementado.

Ya existe:

- Banco de proyectos.
- Proyecto activo.
- Presupuesto.
- APUs.
- Módulos MGA.
- Copiloto.
- Orquestador.
- Autocompletado inicial.
- Documentos base.
- PDFs.
- Excel.

Falta:

- Inspector MGA Web.
- Mapa automático de campos MGA Web.
- Puente presupuesto-cadena de valor.
- Población completa.
- Participantes.
- Alternativas.
- Política pública.
- Fuentes por vigencia.
- Cronograma físico-financiero.
- Bus de eventos.

============================================================
26. OBJETIVO DEL FLUJO DEL SISTEMA
============================================================

El objetivo final es que Constructor MGA Pro funcione como un sistema
integrado donde el usuario no tenga que repetir información.

Una idea debe convertirse progresivamente en:

- formulación MGA;
- presupuesto;
- documentos;
- indicadores;
- riesgos;
- cronograma;
- fuentes;
- soportes;
- información lista para MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================
