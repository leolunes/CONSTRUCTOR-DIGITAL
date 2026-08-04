// =====================================
// CATALOGO.JS
// CONSTRUCTOR MGA PRO
// Administrador central de catálogos de conocimiento
// =====================================

const CatalogoMGA = (() => {

    const REGISTRO = {};

    function registrar(nombre, data){
        const key = normalizarClave(nombre);
        if(!key || !data){
            console.warn("[CatalogoMGA] No se pudo registrar catálogo:", nombre);
            return false;
        }
        REGISTRO[key] = data;
        return true;
    }

    function existe(nombre){
        return !!REGISTRO[normalizarClave(nombre)];
    }

    function obtener(nombre){
        return REGISTRO[normalizarClave(nombre)] || null;
    }

    function listarCatalogos(){
        return Object.keys(REGISTRO).sort();
    }

    function listar(nombre){
        const cat = obtener(nombre);
        if(!cat) return [];

        if(Array.isArray(cat)) return cat;
        if(Array.isArray(cat.items)) return cat.items;
        if(cat.categorias) return listarDesdeCategorias(cat.categorias);

        return Object.values(cat);
    }

    function listarDesdeCategorias(categorias){
        const salida = [];

        Object.keys(categorias || {}).forEach(catKey => {
            const grupo = categorias[catKey];

            Object.keys(grupo || {}).forEach(itemKey => {
                const item = grupo[itemKey];

                salida.push({
                    ...item,
                    categoria: item.categoria || catKey,
                    clave: item.clave || itemKey
                });
            });
        });

        return salida;
    }

    function obtenerElemento(nombreCatalogo, codigo){
        const elementos = listar(nombreCatalogo);
        const cod = normalizarClave(codigo);

        return elementos.find(item => {
            return normalizarClave(item.id) === cod ||
                   normalizarClave(item.codigo) === cod ||
                   normalizarClave(item.clave) === cod ||
                   normalizarClave(item.nombre) === cod;
        }) || null;
    }

    function obtenerPorCategoria(nombreCatalogo, categoria){
        const elementos = listar(nombreCatalogo);
        const cat = normalizarClave(categoria);

        return elementos.filter(item =>
            normalizarClave(item.categoria) === cat ||
            normalizarClave(item.etapa) === cat ||
            normalizarClave(item.tipo) === cat
        );
    }

    function buscar(nombreCatalogo, texto){
        const elementos = listar(nombreCatalogo);
        const q = normalizarTexto(texto);

        if(!q) return elementos;

        return elementos.filter(item => {
            const base = [
                item.id,
                item.codigo,
                item.clave,
                item.nombre,
                item.descripcion,
                item.categoria,
                item.tipo,
                item.etapa,
                ...(item.palabrasClave || [])
            ].filter(Boolean).join(" ");

            return normalizarTexto(base).includes(q);
        });
    }

    function buscarGlobal(texto){
        const resultados = [];

        listarCatalogos().forEach(nombre => {
            buscar(nombre, texto).forEach(item => {
                resultados.push({
                    catalogo: nombre,
                    item
                });
            });
        });

        return resultados;
    }

    function validarReferencia(nombreCatalogo, codigo){
        return !!obtenerElemento(nombreCatalogo, codigo);
    }

    function validarReferencias(nombreCatalogo, codigos = []){
        return codigos.map(codigo => ({
            codigo,
            existe: validarReferencia(nombreCatalogo, codigo)
        }));
    }

    function referenciasFaltantes(nombreCatalogo, codigos = []){
        return validarReferencias(nombreCatalogo, codigos)
            .filter(x => !x.existe)
            .map(x => x.codigo);
    }

    function clonarElemento(nombreCatalogo, codigo){
        const item = obtenerElemento(nombreCatalogo, codigo);
        if(!item) return null;
        return clonar(item);
    }

    function clonarLista(nombreCatalogo, codigos = []){
        return codigos
            .map(codigo => clonarElemento(nombreCatalogo, codigo))
            .filter(Boolean);
    }

    function resolverActividades(codigos = []){
        return clonarLista("actividades", codigos);
    }

    function resolverProductos(codigos = []){
        return clonarLista("productos", codigos);
    }

    function resolverIndicadores(codigos = []){
        return clonarLista("indicadores", codigos);
    }

    function resolverRiesgos(codigos = []){
        return clonarLista("riesgos", codigos);
    }

    function resolverNormas(codigos = []){
        return clonarLista("normatividad", codigos);
    }

    function resolverPoblaciones(codigos = []){
        return clonarLista("poblaciones", codigos);
    }

    function estadisticas(){
        const detalle = {};

        listarCatalogos().forEach(nombre => {
            detalle[nombre] = listar(nombre).length;
        });

        const totalElementos = Object.values(detalle)
            .reduce((s, n) => s + Number(n || 0), 0);

        return {
            catalogos: listarCatalogos().length,
            totalElementos,
            detalle
        };
    }

    function normalizarClave(value){
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/_/g, "-")
            .trim();
    }

    function normalizarTexto(value){
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function clonar(obj){
        try{
            if(typeof structuredClone === "function"){
                return structuredClone(obj);
            }
        }catch(_){}

        return JSON.parse(JSON.stringify(obj));
    }

    return {
        registrar,
        existe,
        obtener,
        listarCatalogos,
        listar,
        obtenerElemento,
        obtenerPorCategoria,
        buscar,
        buscarGlobal,
        validarReferencia,
        validarReferencias,
        referenciasFaltantes,
        clonarElemento,
        clonarLista,

        resolverActividades,
        resolverProductos,
        resolverIndicadores,
        resolverRiesgos,
        resolverNormas,
        resolverPoblaciones,

        estadisticas
    };

})();

window.CatalogoMGA = CatalogoMGA;
