// =====================================
// SECTORES.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de sectores de inversión pública
// =====================================

const CatalogoSectores = {

    nombre:
    "Catálogo Maestro de Sectores",

    version:
    "1.0.0",

    descripcion:
    "Banco reutilizable de sectores de inversión pública para clasificar proyectos, plantillas, tipologías y reglas de formulación.",

    categorias: {

        SOCIALES: {

            DESARROLLO_SOCIAL: {
                id: "SEC-SOC-001",
                codigo: "SEC-SOC-001",
                nombre: "Desarrollo Social",
                descripcion: "Proyectos orientados al bienestar, inclusión social, atención a población vulnerable, familia, adulto mayor, primera infancia, juventud, mujer, discapacidad y víctimas.",
                grupo: "Social",
                tipologias: [
                    "Centro Vida",
                    "Centro Día",
                    "Centro Integral de Bienestar",
                    "Centro Comunitario",
                    "Atención a Adulto Mayor",
                    "Atención a Víctimas",
                    "Atención a Discapacidad",
                    "Programas de Mujer",
                    "Programas de Juventud",
                    "Primera Infancia"
                ],
                poblacionesFrecuentes: [
                    "POB-CV-006",
                    "POB-VUL-001",
                    "POB-VUL-002",
                    "POB-VUL-003",
                    "POB-CV-004",
                    "POB-CV-001"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-DOT-001",
                    "PRO-SER-001",
                    "PRO-SER-003",
                    "PRO-FOR-001"
                ],
                riesgosFrecuentes: [
                    "RIE-SOC-001",
                    "RIE-FIN-001",
                    "RIE-CON-001",
                    "RIE-CON-002"
                ],
                normasFrecuentes: [
                    "NOR-SOC-001",
                    "NOR-SOC-002",
                    "NOR-SOC-003",
                    "NOR-SOC-004",
                    "NOR-SOC-005",
                    "NOR-SOC-006"
                ],
                palabrasClave: [
                    "social",
                    "bienestar",
                    "adulto mayor",
                    "centro vida",
                    "discapacidad",
                    "víctimas",
                    "mujer",
                    "juventud",
                    "familia"
                ]
            },

            SALUD: {
                id: "SEC-SOC-002",
                codigo: "SEC-SOC-002",
                nombre: "Salud",
                descripcion: "Proyectos orientados a infraestructura, dotación, prestación, promoción, prevención y fortalecimiento de servicios de salud.",
                grupo: "Social",
                tipologias: [
                    "Centro de Salud",
                    "Puesto de Salud",
                    "Hospital",
                    "Dotación Biomédica",
                    "Ambulancia",
                    "Promoción y Prevención",
                    "Salud Pública"
                ],
                poblacionesFrecuentes: [
                    "POB-SEC-003",
                    "POB-TER-003",
                    "POB-VUL-001",
                    "POB-CV-006"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-DOT-001",
                    "PRO-DOT-002",
                    "PRO-SER-001",
                    "PRO-SER-003"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-FIN-001",
                    "RIE-CON-001",
                    "RIE-CON-002"
                ],
                normasFrecuentes: [
                    "NOR-SAL-001",
                    "NOR-SAL-002",
                    "NOR-SAL-003",
                    "NOR-SAL-004"
                ],
                palabrasClave: [
                    "salud",
                    "hospital",
                    "centro de salud",
                    "puesto de salud",
                    "dotación biomédica",
                    "pacientes"
                ]
            },

            EDUCACION: {
                id: "SEC-SOC-003",
                codigo: "SEC-SOC-003",
                nombre: "Educación",
                descripcion: "Proyectos orientados a infraestructura educativa, dotación escolar, calidad educativa, permanencia, cobertura y fortalecimiento institucional.",
                grupo: "Social",
                tipologias: [
                    "Colegio",
                    "Escuela",
                    "Aula",
                    "Biblioteca Escolar",
                    "Laboratorio",
                    "Restaurante Escolar",
                    "Dotación Escolar"
                ],
                poblacionesFrecuentes: [
                    "POB-SEC-001",
                    "POB-SEC-002",
                    "POB-CV-002",
                    "POB-CV-003"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-DOT-001",
                    "PRO-DOT-003",
                    "PRO-FOR-001",
                    "PRO-FOR-002"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-FIN-001",
                    "RIE-CON-001",
                    "RIE-SOC-001"
                ],
                normasFrecuentes: [
                    "NOR-EDU-001",
                    "NOR-EDU-002",
                    "NOR-EDU-003",
                    "NOR-EDU-004"
                ],
                palabrasClave: [
                    "educación",
                    "colegio",
                    "escuela",
                    "aula",
                    "estudiantes",
                    "docentes"
                ]
            }

        },

        INFRAESTRUCTURA_TERRITORIAL: {

            TRANSPORTE: {
                id: "SEC-INF-001",
                codigo: "SEC-INF-001",
                nombre: "Transporte",
                descripcion: "Proyectos de movilidad, conectividad, infraestructura vial, transporte urbano y rural, puentes, pavimentos y placa huella.",
                grupo: "Infraestructura",
                tipologias: [
                    "Pavimento Urbano",
                    "Vía Rural",
                    "Placa Huella",
                    "Puente",
                    "Andenes",
                    "Cicloruta",
                    "Mejoramiento Vial"
                ],
                poblacionesFrecuentes: [
                    "POB-TER-001",
                    "POB-TER-002",
                    "POB-TER-003"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-INF-003",
                    "PRO-INF-004",
                    "PRO-INF-005"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-TEC-002",
                    "RIE-FIN-001",
                    "RIE-AMB-001",
                    "RIE-AMB-002"
                ],
                normasFrecuentes: [
                    "NOR-TRA-001",
                    "NOR-TRA-002",
                    "NOR-TRA-003"
                ],
                palabrasClave: [
                    "transporte",
                    "vía",
                    "pavimento",
                    "placa huella",
                    "puente",
                    "movilidad"
                ]
            },

            AGUA_POTABLE_SANEAMIENTO: {
                id: "SEC-INF-002",
                codigo: "SEC-INF-002",
                nombre: "Agua Potable y Saneamiento Básico",
                descripcion: "Proyectos de acueducto, alcantarillado, PTAP, PTAR, saneamiento, tratamiento de aguas y servicios públicos domiciliarios.",
                grupo: "Infraestructura",
                tipologias: [
                    "Acueducto",
                    "Alcantarillado",
                    "PTAP",
                    "PTAR",
                    "Saneamiento Básico",
                    "Optimización de Redes",
                    "Tratamiento de Agua"
                ],
                poblacionesFrecuentes: [
                    "POB-TER-001",
                    "POB-TER-002",
                    "POB-TER-003"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-INF-003",
                    "PRO-DOT-002"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-TEC-002",
                    "RIE-FIN-001",
                    "RIE-AMB-002"
                ],
                normasFrecuentes: [
                    "NOR-AGU-001",
                    "NOR-AGU-002",
                    "NOR-AGU-003"
                ],
                palabrasClave: [
                    "agua",
                    "acueducto",
                    "alcantarillado",
                    "ptap",
                    "ptar",
                    "saneamiento"
                ]
            },

            VIVIENDA: {
                id: "SEC-INF-003",
                codigo: "SEC-INF-003",
                nombre: "Vivienda",
                descripcion: "Proyectos de vivienda nueva, mejoramiento de vivienda, urbanismo, hábitat y desarrollo territorial.",
                grupo: "Infraestructura",
                tipologias: [
                    "Vivienda Nueva",
                    "Mejoramiento de Vivienda",
                    "Urbanismo",
                    "Hábitat",
                    "Reasentamiento"
                ],
                poblacionesFrecuentes: [
                    "POB-TER-001",
                    "POB-TER-002",
                    "POB-VUL-002",
                    "POB-VUL-001"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-INF-005"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-FIN-001",
                    "RIE-CON-001",
                    "RIE-SOC-002"
                ],
                normasFrecuentes: [
                    "NOR-AGU-003"
                ],
                palabrasClave: [
                    "vivienda",
                    "hábitat",
                    "mejoramiento",
                    "urbanismo"
                ]
            }

        },

        CULTURA_DEPORTE_AMBIENTE: {

            DEPORTE: {
                id: "SEC-CDA-001",
                codigo: "SEC-CDA-001",
                nombre: "Deporte y Recreación",
                descripcion: "Proyectos de infraestructura deportiva, recreación, actividad física, escenarios deportivos y programas de deporte social comunitario.",
                grupo: "Cultura, Deporte y Ambiente",
                tipologias: [
                    "Polideportivo",
                    "Cancha Sintética",
                    "Cancha Múltiple",
                    "Parque Recreativo",
                    "Coliseo",
                    "Piscina",
                    "Programa Deportivo"
                ],
                poblacionesFrecuentes: [
                    "POB-SEC-004",
                    "POB-CV-004",
                    "POB-CV-003",
                    "POB-TER-003"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-DOT-001",
                    "PRO-SER-002",
                    "PRO-FOR-001"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-FIN-001",
                    "RIE-CON-001",
                    "RIE-SOC-001"
                ],
                normasFrecuentes: [
                    "NOR-DEP-001"
                ],
                palabrasClave: [
                    "deporte",
                    "recreación",
                    "cancha",
                    "polideportivo",
                    "coliseo"
                ]
            },

            CULTURA: {
                id: "SEC-CDA-002",
                codigo: "SEC-CDA-002",
                nombre: "Cultura",
                descripcion: "Proyectos de infraestructura cultural, patrimonio, bibliotecas, casas de cultura, formación artística y circulación cultural.",
                grupo: "Cultura, Deporte y Ambiente",
                tipologias: [
                    "Casa de Cultura",
                    "Biblioteca",
                    "Escuela de Formación Artística",
                    "Patrimonio Cultural",
                    "Centro Cultural",
                    "Eventos Culturales"
                ],
                poblacionesFrecuentes: [
                    "POB-TER-003",
                    "POB-CV-004",
                    "POB-CV-002",
                    "POB-CV-003"
                ],
                productosFrecuentes: [
                    "PRO-INF-001",
                    "PRO-INF-002",
                    "PRO-DOT-001",
                    "PRO-FOR-001",
                    "PRO-SER-002"
                ],
                riesgosFrecuentes: [
                    "RIE-FIN-001",
                    "RIE-CON-001",
                    "RIE-SOC-001"
                ],
                normasFrecuentes: [
                    "NOR-CUL-001",
                    "NOR-CUL-002"
                ],
                palabrasClave: [
                    "cultura",
                    "biblioteca",
                    "casa de cultura",
                    "patrimonio",
                    "artístico"
                ]
            },

            AMBIENTE: {
                id: "SEC-CDA-003",
                codigo: "SEC-CDA-003",
                nombre: "Ambiente y Desarrollo Sostenible",
                descripcion: "Proyectos de protección ambiental, restauración ecológica, gestión del riesgo ambiental, educación ambiental y sostenibilidad.",
                grupo: "Cultura, Deporte y Ambiente",
                tipologias: [
                    "Restauración Ecológica",
                    "Reforestación",
                    "Educación Ambiental",
                    "Gestión de Residuos",
                    "Protección de Fuentes Hídricas",
                    "Parques Ambientales"
                ],
                poblacionesFrecuentes: [
                    "POB-TER-001",
                    "POB-TER-002",
                    "POB-TER-003"
                ],
                productosFrecuentes: [
                    "PRO-SER-002",
                    "PRO-FOR-001",
                    "PRO-FOR-003",
                    "PRO-GES-003"
                ],
                riesgosFrecuentes: [
                    "RIE-AMB-001",
                    "RIE-AMB-002",
                    "RIE-SOC-001",
                    "RIE-FIN-001"
                ],
                normasFrecuentes: [
                    "NOR-AMB-001",
                    "NOR-AMB-002"
                ],
                palabrasClave: [
                    "ambiente",
                    "reforestación",
                    "restauración",
                    "residuos",
                    "educación ambiental"
                ]
            }

        },

        PRODUCTIVO_TECNOLOGICO: {

            AGRICULTURA: {
                id: "SEC-PRO-001",
                codigo: "SEC-PRO-001",
                nombre: "Agricultura y Desarrollo Rural",
                descripcion: "Proyectos de producción agropecuaria, asistencia técnica, fortalecimiento de productores, cadenas productivas, riego y seguridad alimentaria.",
                grupo: "Productivo",
                tipologias: [
                    "Asistencia Técnica Agropecuaria",
                    "Fortalecimiento Productivo",
                    "Riego",
                    "Seguridad Alimentaria",
                    "Cadenas Productivas",
                    "Dotación Agropecuaria"
                ],
                poblacionesFrecuentes: [
                    "POB-SEC-005",
                    "POB-TER-001"
                ],
                productosFrecuentes: [
                    "PRO-FOR-003",
                    "PRO-FOR-004",
                    "PRO-DOT-004",
                    "PRO-SER-002"
                ],
                riesgosFrecuentes: [
                    "RIE-AMB-001",
                    "RIE-FIN-001",
                    "RIE-SOC-001"
                ],
                normasFrecuentes: [
                    "NOR-GEN-001",
                    "NOR-GEN-002"
                ],
                palabrasClave: [
                    "agricultura",
                    "rural",
                    "productores",
                    "agropecuario",
                    "asistencia técnica"
                ]
            },

            TIC: {
                id: "SEC-PRO-002",
                codigo: "SEC-PRO-002",
                nombre: "Tecnologías de la Información y las Comunicaciones",
                descripcion: "Proyectos de conectividad, transformación digital, plataformas tecnológicas, sistemas de información y apropiación digital.",
                grupo: "Tecnológico",
                tipologias: [
                    "Conectividad",
                    "Zona Digital",
                    "Sistema de Información",
                    "Plataforma Tecnológica",
                    "Gobierno Digital",
                    "Capacitación TIC"
                ],
                poblacionesFrecuentes: [
                    "POB-TER-003",
                    "POB-SEC-001",
                    "POB-SEC-002"
                ],
                productosFrecuentes: [
                    "PRO-TIC-001",
                    "PRO-TIC-002",
                    "PRO-TIC-003",
                    "PRO-FOR-001"
                ],
                riesgosFrecuentes: [
                    "RIE-TEC-001",
                    "RIE-FIN-001",
                    "RIE-CON-001"
                ],
                normasFrecuentes: [
                    "NOR-TIC-001",
                    "NOR-TIC-002"
                ],
                palabrasClave: [
                    "tic",
                    "tecnología",
                    "software",
                    "conectividad",
                    "plataforma"
                ]
            }

        }

    }

};

if(window.CatalogoMGA){
    CatalogoMGA.registrar("sectores", CatalogoSectores);
}

window.CatalogoSectores = CatalogoSectores;
