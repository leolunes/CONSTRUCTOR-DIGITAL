// =====================================
// RIESGOS.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de riesgos MGA
// =====================================

const CatalogoRiesgos={

nombre:"Catálogo Maestro de Riesgos MGA",

version:"1.0.0",

descripcion:"Banco reutilizable de riesgos para proyectos de inversión pública.",

categorias:{

TECNICOS:{

ESTUDIOS_INSUFICIENTES:{
id:"RIE-TEC-001",
codigo:"RIE-TEC-001",
nombre:"Estudios técnicos insuficientes",
categoria:"Técnico",
descripcion:"La información técnica resulta insuficiente para ejecutar el proyecto.",
probabilidad:"Media",
impacto:"Alto",
nivel:"Alto",
tratamiento:"Completar estudios, validar diseños y revisión técnica independiente.",
palabrasClave:["estudios","diseños","ingeniería"]
},

ERRORES_DISENO:{
id:"RIE-TEC-002",
codigo:"RIE-TEC-002",
nombre:"Errores en diseños",
categoria:"Técnico",
descripcion:"Los diseños requieren modificaciones durante la ejecución.",
probabilidad:"Media",
impacto:"Alto",
nivel:"Alto",
tratamiento:"Revisión interdisciplinaria y control de calidad.",
palabrasClave:["diseños","planos"]
}

},

FINANCIEROS:{

AUMENTO_COSTOS:{
id:"RIE-FIN-001",
codigo:"RIE-FIN-001",
nombre:"Incremento de costos",
categoria:"Financiero",
descripcion:"Incremento en precios de materiales, equipos o servicios.",
probabilidad:"Alta",
impacto:"Alto",
nivel:"Crítico",
tratamiento:"Actualizar presupuestos, análisis de mercado y contingencias.",
palabrasClave:["costos","inflación","precios"]
},

DESFINANCIACION:{
id:"RIE-FIN-002",
codigo:"RIE-FIN-002",
nombre:"Insuficiencia de recursos",
categoria:"Financiero",
descripcion:"La financiación disponible resulta insuficiente para culminar el proyecto.",
probabilidad:"Media",
impacto:"Alto",
nivel:"Alto",
tratamiento:"Gestionar nuevas fuentes y seguimiento financiero.",
palabrasClave:["financiación","presupuesto"]
}

},

CONTRACTUALES:{

RETRASO_CONTRATACION:{
id:"RIE-CON-001",
codigo:"RIE-CON-001",
nombre:"Retraso en contratación",
categoria:"Contractual",
descripcion:"Demoras en procesos precontractuales o contractuales.",
probabilidad:"Alta",
impacto:"Medio",
nivel:"Alto",
tratamiento:"Planeación contractual y seguimiento permanente.",
palabrasClave:["SECOP","contratación"]
},

INCUMPLIMIENTO_CONTRATISTA:{
id:"RIE-CON-002",
codigo:"RIE-CON-002",
nombre:"Incumplimiento del contratista",
categoria:"Contractual",
descripcion:"El contratista incumple obligaciones o cronograma.",
probabilidad:"Media",
impacto:"Alto",
nivel:"Alto",
tratamiento:"Seguimiento, interventoría y aplicación de garantías.",
palabrasClave:["contratista","incumplimiento"]
}

},

SOCIALES:{

BAJA_PARTICIPACION:{
id:"RIE-SOC-001",
codigo:"RIE-SOC-001",
nombre:"Baja participación comunitaria",
categoria:"Social",
descripcion:"Escasa participación de la población beneficiaria.",
probabilidad:"Media",
impacto:"Medio",
nivel:"Medio",
tratamiento:"Fortalecer la estrategia de participación y socialización.",
palabrasClave:["comunidad","participación"]
},

CONFLICTO_SOCIAL:{
id:"RIE-SOC-002",
codigo:"RIE-SOC-002",
nombre:"Conflictos con la comunidad",
categoria:"Social",
descripcion:"Inconformidad o conflictos durante la ejecución.",
probabilidad:"Baja",
impacto:"Alto",
nivel:"Medio",
tratamiento:"Mesas de diálogo y gestión social permanente.",
palabrasClave:["comunidad","conflictos"]
}

},

AMBIENTALES:{

CLIMA:{
id:"RIE-AMB-001",
codigo:"RIE-AMB-001",
nombre:"Condiciones climáticas adversas",
categoria:"Ambiental",
descripcion:"Lluvias u otros eventos climáticos afectan la ejecución.",
probabilidad:"Alta",
impacto:"Medio",
nivel:"Alto",
tratamiento:"Programación flexible y planes de contingencia.",
palabrasClave:["lluvias","clima"]
},

PERMISOS:{
id:"RIE-AMB-002",
codigo:"RIE-AMB-002",
nombre:"Demoras en permisos ambientales",
categoria:"Ambiental",
descripcion:"Retrasos en licencias, permisos o autorizaciones.",
probabilidad:"Media",
impacto:"Alto",
nivel:"Alto",
tratamiento:"Gestionar permisos desde la planeación.",
palabrasClave:["licencia","permisos"]
}

}

}

};

if(window.CatalogoMGA){
CatalogoMGA.registrar("riesgos",CatalogoRiesgos);
}

window.CatalogoRiesgos=CatalogoRiesgos;
