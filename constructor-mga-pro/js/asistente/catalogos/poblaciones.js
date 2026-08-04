// =====================================
// POBLACIONES.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de poblaciones objetivo
// =====================================

const CatalogoPoblaciones={

nombre:"Catálogo Maestro de Poblaciones",

version:"1.0.0",

descripcion:"Banco reutilizable de poblaciones objetivo para proyectos MGA.",

categorias:{

CICLO_VIDA:{

PRIMERA_INFANCIA:{
id:"POB-CV-001",
codigo:"POB-CV-001",
nombre:"Primera infancia",
descripcion:"Niños y niñas de 0 a 5 años.",
grupoEtario:"0-5 años",
palabrasClave:["primera infancia","niños","icbf","cdi"]
},

INFANCIA:{
id:"POB-CV-002",
codigo:"POB-CV-002",
nombre:"Infancia",
descripcion:"Niños entre 6 y 11 años.",
grupoEtario:"6-11 años",
palabrasClave:["niños","escuela"]
},

ADOLESCENCIA:{
id:"POB-CV-003",
codigo:"POB-CV-003",
nombre:"Adolescentes",
descripcion:"Población adolescente.",
grupoEtario:"12-17 años",
palabrasClave:["adolescentes","jóvenes"]
},

JUVENTUD:{
id:"POB-CV-004",
codigo:"POB-CV-004",
nombre:"Juventud",
descripcion:"Jóvenes entre 14 y 28 años.",
grupoEtario:"14-28 años",
palabrasClave:["juventud","jóvenes"]
},

ADULTOS:{
id:"POB-CV-005",
codigo:"POB-CV-005",
nombre:"Adultos",
descripcion:"Población adulta.",
grupoEtario:"29-59 años",
palabrasClave:["adultos"]
},

ADULTO_MAYOR:{
id:"POB-CV-006",
codigo:"POB-CV-006",
nombre:"Adulto mayor",
descripcion:"Personas de 60 años o más.",
grupoEtario:"60+",
palabrasClave:["adulto mayor","centro vida","centro día"]
}

},

POBLACION_VULNERABLE:{

DISCAPACIDAD:{
id:"POB-VUL-001",
codigo:"POB-VUL-001",
nombre:"Personas con discapacidad",
descripcion:"Personas con discapacidad física, sensorial, cognitiva o múltiple.",
palabrasClave:["discapacidad","inclusión"]
},

VICTIMAS:{
id:"POB-VUL-002",
codigo:"POB-VUL-002",
nombre:"Víctimas del conflicto",
descripcion:"Población víctima del conflicto armado.",
palabrasClave:["víctimas","conflicto"]
},

MUJERES:{
id:"POB-VUL-003",
codigo:"POB-VUL-003",
nombre:"Mujeres",
descripcion:"Mujeres beneficiarias de programas sociales o productivos.",
palabrasClave:["mujeres","equidad"]
},

COMUNIDADES_ETNICAS:{
id:"POB-VUL-004",
codigo:"POB-VUL-004",
nombre:"Comunidades étnicas",
descripcion:"Comunidades indígenas, afrodescendientes, raizales, ROM y palenqueras.",
palabrasClave:["étnicas","indígenas","afro"]
},

HABITANTE_CALLE:{
id:"POB-VUL-005",
codigo:"POB-VUL-005",
nombre:"Habitantes de calle",
descripcion:"Población habitante de calle o en riesgo de habitarla.",
palabrasClave:["habitante de calle"]
}

},

SECTORIALES:{

ESTUDIANTES:{
id:"POB-SEC-001",
codigo:"POB-SEC-001",
nombre:"Estudiantes",
descripcion:"Estudiantes de instituciones educativas.",
palabrasClave:["educación","estudiantes"]
},

DOCENTES:{
id:"POB-SEC-002",
codigo:"POB-SEC-002",
nombre:"Docentes",
descripcion:"Docentes y directivos docentes.",
palabrasClave:["docentes"]
},

PACIENTES:{
id:"POB-SEC-003",
codigo:"POB-SEC-003",
nombre:"Pacientes",
descripcion:"Usuarios del sistema de salud.",
palabrasClave:["salud","pacientes"]
},

DEPORTISTAS:{
id:"POB-SEC-004",
codigo:"POB-SEC-004",
nombre:"Deportistas",
descripcion:"Población participante en programas deportivos.",
palabrasClave:["deporte","deportistas"]
},

PRODUCTORES:{
id:"POB-SEC-005",
codigo:"POB-SEC-005",
nombre:"Productores agropecuarios",
descripcion:"Pequeños y medianos productores agropecuarios.",
palabrasClave:["agricultura","productores"]
}

},

TERRITORIAL:{

POBLACION_RURAL:{
id:"POB-TER-001",
codigo:"POB-TER-001",
nombre:"Población rural",
descripcion:"Habitantes del sector rural.",
palabrasClave:["rural","veredas"]
},

POBLACION_URBANA:{
id:"POB-TER-002",
codigo:"POB-TER-002",
nombre:"Población urbana",
descripcion:"Habitantes del sector urbano.",
palabrasClave:["urbano","barrios"]
},

COMUNIDAD_GENERAL:{
id:"POB-TER-003",
codigo:"POB-TER-003",
nombre:"Comunidad en general",
descripcion:"Toda la población del área de influencia.",
palabrasClave:["comunidad","ciudadanía","habitantes"]
}

}

}

};

if(window.CatalogoMGA){
CatalogoMGA.registrar("poblaciones",CatalogoPoblaciones);
}

window.CatalogoPoblaciones=CatalogoPoblaciones;
