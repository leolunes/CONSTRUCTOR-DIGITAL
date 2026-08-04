# ARQUITECTURA GENERAL
# CONSTRUCTOR MGA PRO
# Plataforma Inteligente de Formulación de Proyectos de Inversión Pública
# Versión 1.0
# Ubicación sugerida:
# docs/01-Arquitectura/arquitectura-general.md

============================================================
1. PROPÓSITO DEL DOCUMENTO
============================================================

Este documento describe la arquitectura general del Constructor MGA Pro.

Su objetivo es explicar cómo está organizada la plataforma, cuáles son
sus subsistemas principales y cómo se relacionan entre sí.

A partir de este documento, todo nuevo desarrollo deberá ubicarse dentro
de una arquitectura clara, evitando que la aplicación crezca de forma
desordenada.

============================================================
2. VISIÓN GENERAL DE LA PLATAFORMA
============================================================

Constructor MGA Pro es una plataforma inteligente para la formulación
integral de proyectos de inversión pública.

Integra cuatro grandes capacidades:

1. Formulación MGA.
2. Presupuesto APU.
3. Generación documental.
4. Inteligencia asistida mediante motores y copiloto.

La plataforma no debe entenderse como una simple colección de páginas,
sino como un ecosistema integrado donde cada módulo aporta información
al objeto central: el Proyecto.

============================================================
3. PRINCIPIO ARQUITECTÓNICO CENTRAL
============================================================

El Proyecto es la unidad principal del sistema.

Todo gira alrededor del proyecto:

- Datos básicos.
- Diagnóstico.
- Objetivos.
- Cadena de valor.
- Indicadores.
- Riesgos.
- Presupuesto.
- APUs.
- Documentos.
- Memoria inteligente.
- Inspector.
- Exportaciones.

Ningún módulo debe funcionar como una isla. Todos deben leer y escribir
en una estructura común de datos del proyecto.

============================================================
4. CAPAS DE LA PLATAFORMA
============================================================

La plataforma se organiza en cinco capas principales:

------------------------------------------------------------
CAPA 1: DATOS
------------------------------------------------------------

Contiene toda la información del proyecto.

Incluye:

- Objeto Proyecto.
- Presupuesto.
- APUs.
- Catálogos.
- Adjuntos.
- Memoria inteligente.
- Historial.
- Cobertura MGA Web.

------------------------------------------------------------
CAPA 2: CONOCIMIENTO
------------------------------------------------------------

Contiene el conocimiento técnico y metodológico.

Incluye:

- Sectores.
- Tipologías.
- Productos.
- Actividades.
- Indicadores.
- Riesgos.
- Normatividad.
- Fuentes de financiación.
- Reglas de formulación.

------------------------------------------------------------
CAPA 3: INTELIGENCIA
------------------------------------------------------------

Contiene los motores inteligentes.

Incluye:

- Motor de Análisis.
- Motor de Conocimiento.
- Motor Generador.
- Motor de Coherencia.
- Motor Orquestador.
- Motor de Autocompletado.
- Copiloto.
- Memoria Inteligente.
- Inspector MGA.

------------------------------------------------------------
CAPA 4: CONSTRUCCIÓN
------------------------------------------------------------

Contiene los módulos donde se estructura el proyecto.

Incluye:

- Identificación.
- Diagnóstico.
- Árbol de Problemas.
- Árbol de Objetivos.
- Participantes.
- Población.
- Alternativas.
- Cadena de Valor.
- Indicadores.
- Riesgos.
- Cronograma.
- Presupuesto.
- Documentos.

------------------------------------------------------------
CAPA 5: PRESENTACIÓN E INTEGRACIÓN
------------------------------------------------------------

Contiene las pantallas, reportes y salidas.

Incluye:

- Interfaz web.
- PDF.
- Excel.
- JSON.
- Backup.
- Preparación para MGA Web.
- Paneles de cobertura.
- Dashboards.

============================================================
5. LOS OCHO SUBSISTEMAS PRINCIPALES
============================================================

La plataforma se divide en ocho subsistemas.

============================================================
5.1 SUBSISTEMA 1: NÚCLEO DEL PROYECTO
============================================================

Función:
Administrar el objeto Proyecto como unidad central del sistema.

Responsabilidades:

- Crear proyectos.
- Guardar proyectos.
- Actualizar proyectos.
- Importar y exportar proyectos.
- Mantener estado general.
- Conservar trazabilidad.
- Servir como fuente única de verdad.

Componentes relacionados:

- Banco de proyectos.
- Storage.
- IndexedDB.
- LocalStorage.
- Backup.
- Exportación JSON.

Archivos relacionados actuales:

- proyectos.html
- proyecto-detalle.html
- js/storage.js
- js/db.js
- js/app.js

============================================================
5.2 SUBSISTEMA 2: CONSTRUCTOR TÉCNICO MGA
============================================================

Función:
Construir toda la formulación metodológica del proyecto.

Responsabilidades:

- Identificación MGA.
- Diagnóstico.
- Problema central.
- Causas y efectos.
- Objetivos.
- Participantes.
- Población.
- Alternativas.
- Cadena de valor.
- Indicadores.
- Riesgos.
- Cronograma.
- Sostenibilidad.

Componentes actuales:

- Diagnóstico.
- Árbol de Problemas.
- Árbol de Objetivos.
- Cadena de Valor.
- Indicadores.
- Riesgos.
- Cronograma.
- Documentos MGA.

Archivos relacionados actuales:

- diagnostico.html
- mga.html
- indicadores.html
- riesgos.html
- documentos.html
- cronograma.html
- js/mga.js
- js/mga-dashboard.js

============================================================
5.3 SUBSISTEMA 3: MOTOR PRESUPUESTAL
============================================================

Función:
Administrar toda la información económica, presupuestal y técnica
heredada de Presupuesto Pro.

Responsabilidades:

- Base APU.
- Capítulos.
- Ítems.
- APUs.
- Insumos.
- Subproductos.
- Costos directos.
- Administración.
- Imprevistos.
- Utilidad.
- IVA.
- Costos indirectos.
- PDFs presupuestales.
- Excel.

Archivos relacionados actuales:

- js/base-import.js
- js/calc.js
- js/pdf.js
- js/asistente/motor-presupuesto.js
- proyecto-detalle.html

Este subsistema es fundamental porque conecta la formulación MGA con
el soporte económico del proyecto.

============================================================
5.4 SUBSISTEMA 4: MOTOR DOCUMENTAL
============================================================

Función:
Generar y administrar textos, documentos y soportes del proyecto.

Responsabilidades:

- Diagnóstico técnico.
- Justificación.
- Descripción del proyecto.
- Resumen ejecutivo.
- Marco lógico.
- Sostenibilidad.
- Beneficios.
- Especificaciones técnicas.
- PDFs.
- Documentos anexos.

Archivos relacionados actuales:

- documentos.html
- js/pdf.js
- js/asistente/experto/motor-documentos.js
- js/asistente/motor-exportador.js

============================================================
5.5 SUBSISTEMA 5: INTELIGENCIA ARTIFICIAL Y MOTORES
============================================================

Función:
Interpretar, generar, validar y autocompletar información del proyecto.

Responsabilidades:

- Analizar ideas.
- Detectar sector y tipología.
- Consultar conocimiento.
- Generar estructura MGA.
- Recomendar fuentes.
- Generar riesgos.
- Generar indicadores.
- Validar coherencia.
- Orquestar motores.
- Autocompletar el proyecto.
- Mantener memoria inteligente.

Motores actuales:

- MotorConocimiento.
- MotorAnalisis.
- MotorCoherencia.
- MotorGenerador.
- MotorSugerencias.
- MotorFinanciacion.
- MotorRiesgos.
- MotorIndicadores.
- MotorDocumentos.
- MotorAsistente.
- MotorOrquestador.
- MotorAutocompletado.

Archivos relacionados:

- js/asistente/experto/motor-conocimiento.js
- js/asistente/experto/motor-analisis.js
- js/asistente/experto/motor-coherencia.js
- js/asistente/experto/motor-generador.js
- js/asistente/experto/motor-orquestador.js
- js/asistente/experto/motor-autocompletado.js
- js/asistente/experto/copiloto-orquestador.js

============================================================
5.6 SUBSISTEMA 6: BASE DE CONOCIMIENTO
============================================================

Función:
Almacenar el conocimiento técnico utilizado por los motores.

Responsabilidades:

- Sectores.
- Tipologías.
- Productos.
- Actividades.
- Indicadores.
- Riesgos.
- Poblaciones.
- Normatividad.
- Fuentes de financiación.
- Reglas sectoriales.

Archivos actuales:

- js/asistente/catalogos/
- js/asistente/plantillas/
- js/asistente/buscador/
- docs/07-Base-Conocimiento/

Este subsistema permite que el Copiloto y los motores no generen
información de manera aislada, sino a partir de una base técnica.

============================================================
5.7 SUBSISTEMA 7: INTEGRACIONES Y EXPORTACIONES
============================================================

Función:
Permitir la salida, respaldo y traslado de información.

Responsabilidades:

- Exportar JSON.
- Importar JSON.
- Exportar Excel.
- Generar PDF.
- Generar backup.
- Preparar información para MGA Web.
- Preparar documentos técnicos.

Archivos actuales:

- js/pdf.js
- js/asistente/motor-exportador.js
- js/excel-export.js, si aplica.
- proyectos.html
- proyecto-detalle.html

============================================================
5.8 SUBSISTEMA 8: PRESENTACIÓN E INTERFAZ
============================================================

Función:
Mostrar la información al usuario y permitir interacción.

Responsabilidades:

- Banco de proyectos.
- Detalle del proyecto.
- Navegación por módulos.
- Paneles inteligentes.
- Copiloto.
- Dashboards.
- Formularios.
- Tablas.
- Modales.
- Botones.
- Reportes en pantalla.

Archivos actuales:

- index.html
- proyectos.html
- proyecto-detalle.html
- diagnostico.html
- mga.html
- indicadores.html
- riesgos.html
- documentos.html
- css/styles.css
- css/integracion-mga-presupuesto.css
- css/asistente-chat.css
- css/copiloto-orquestador.css

============================================================
6. FLUJO GENERAL DE ALTO NIVEL
============================================================

El flujo general de la plataforma es el siguiente:

USUARIO

↓

BANCO DE PROYECTOS

↓

PROYECTO

↓

COPILOTO / FORMULARIOS

↓

MOTOR ORQUESTADOR

↓

MOTORES ESPECIALIZADOS

↓

ESTRUCTURA DEL PROYECTO

↓

PRESUPUESTO + MGA + DOCUMENTOS

↓

INSPECTOR / VALIDACIÓN

↓

EXPORTACIONES / MGA WEB

============================================================
7. RELACIÓN ENTRE MGA Y PRESUPUESTO
============================================================

Una decisión clave de arquitectura es que MGA y Presupuesto no deben
ser dos sistemas separados.

La relación correcta es:

- La MGA define la intervención.
- La cadena de valor define productos y actividades.
- El presupuesto da soporte económico.
- Los APUs explican técnicamente los costos.
- Los documentos consolidan la formulación.

Por lo tanto:

Cadena de Valor

↓

Actividades

↓

Ítems de Presupuesto

↓

APUs

↓

Costos

↓

Fuentes de Financiación

↓

MGA Web

============================================================
8. RELACIÓN ENTRE COPILOTO Y PROYECTO
============================================================

El Copiloto no debe limitarse a mostrar sugerencias.

Debe:

1. Interpretar la idea del usuario.
2. Identificar sector y tipología.
3. Generar estructura base.
4. Invocar al Orquestador.
5. Crear memoria inteligente.
6. Autocompletar el proyecto.
7. Recomendar próximos pasos.
8. Activar validaciones.
9. Dejar trazabilidad en historial.

El Copiloto debe escribir en la estructura oficial del proyecto,
no en datos paralelos sin conexión.

============================================================
9. RELACIÓN ENTRE DOCUMENTACIÓN Y CÓDIGO
============================================================

Regla permanente:

Primero se documenta.
Luego se programa.

Todo nuevo desarrollo debe tener:

1. Definición funcional.
2. Ubicación arquitectónica.
3. Modelo de datos.
4. Relación con campos MGA Web.
5. Implementación técnica.

============================================================
10. CRITERIOS DE CALIDAD DE LA ARQUITECTURA
============================================================

Un módulo será considerado bien integrado si cumple:

1. Lee y escribe en el objeto Proyecto.
2. No duplica información innecesariamente.
3. Tiene relación con componentes MGA Web.
4. Puede ser validado por el Inspector.
5. Puede ser utilizado por documentos.
6. Puede exportarse.
7. Puede ser entendido por el Copiloto.
8. Conserva trazabilidad.

============================================================
11. ESTADO ACTUAL DE LA ARQUITECTURA
============================================================

Estado general:
Prototipo profesional avanzado.

Fortalezas actuales:

- Banco de proyectos funcional.
- Presupuesto avanzado.
- Base APU.
- PDFs.
- Excel.
- Módulos MGA iniciales.
- Catálogos sectoriales.
- Copiloto.
- Orquestador.
- Autocompletado.
- Documentación estructurada.

Aspectos pendientes:

- Modelo de datos único completamente aplicado.
- Puente presupuesto-cadena de valor.
- Inspector MGA Web.
- Módulos faltantes: política pública, población, participantes y alternativas.
- Cobertura MGA Web medible.
- Validación final de coherencia integral.

============================================================
12. OBJETIVO ARQUITECTÓNICO
============================================================

El objetivo arquitectónico final es que Constructor MGA Pro funcione
como una plataforma integrada donde:

- El usuario escribe una idea.
- El sistema genera la formulación.
- El presupuesto soporta la intervención.
- Los documentos se crean automáticamente.
- El Inspector valida la calidad.
- La información queda lista para MGA Web.

============================================================
FIN DEL DOCUMENTO
============================================================
