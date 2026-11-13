/* Catálogo territorial de Floridablanca. Se mantiene el repertorio inicial de 61
   denominaciones para no afectar fichas existentes y se le agregan los barrios,
   conjuntos, urbanizaciones y asentamientos de las tablas municipales de 2016.
   Los nombres NO representan polígonos ni límites GIS verificables. */
const catalogoMunicipalFlori=window.FLORIDABLANCA_CATALOGO_EXTENDIDO;
const catalogoOriginalFlori=[
    'Abadías','Altamira','Altos de Bellavista','Altos de Cañaveral','Altos de Floridablanca',
    'Altos de Ruitoque','Aranzoque','Bellavista','Bosques de Cañaveral','Bucárica',
    'Buenos Aires','Calatrava','Cañaveral','Cañaveral Occidental','Cañaveral Oriental',
    'Caracolí','Ciudad Valencia','El Bosque','El Carmen','El Páramo','El Reposo',
    'Escoflor','Estancia','Floridablanca Centro','García Echeverry','Guantiguará',
    'La Cumbre','La Florida','La Paz','La Trinidad','Lagos','Lagos II','Lagos III',
    'Las Villas','Los Andes','Los Héroes','Los Molinos','Molinos Altos','Nuevo Villabel',
    'Palomitas','Panorama','Panquitas','Paragüitas','Parques de la Florida','Portal de Santa Ana',
    'Rincón de la Cumbre','Ruitoque Condominio','San Bernardo','San Luis','Santa Ana',
    'Santa Helena','Santa Mónica','Villa España','Villa Luz','Villabel','Zapamanga',
    'Zapamanga I','Zapamanga II','Zapamanga III','Zapamanga IV','Zapamanga V'
];
const nombreKeyFlori=n=>String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const sitiosFlori=new Map();
for(const n of catalogoOriginalFlori)sitiosFlori.set(nombreKeyFlori(n),n);
for(const entry of catalogoMunicipalFlori?.registros||[])sitiosFlori.set(nombreKeyFlori(entry.nombre),entry.nombre);
window.FLORIDABLANCA_TERRITORIO = Object.freeze({
  MUNICIPIO: 'Floridablanca',
  URBANA: 'FLORIDABLANCA - ÁREA URBANA',
  CORREGIMIENTOS: ['CORREGIMIENTO 1', 'CORREGIMIENTO 2', 'CORREGIMIENTO 3'],
  COMUNAS: Array.from({length:8}, (_,i)=>`COMUNA ${i+1}`),
  VEREDAS: [
    'FLORIDABLANCA - ÁREA URBANA',
    'VEREDA ALSACIA', 'VEREDA CASIANO', 'VEREDA GUAYANAS', 'VEREDA HELECHALES',
    'VEREDA AGUABLANCA', 'VEREDA VERICUTE', 'VEREDA RUITOQUE', 'VEREDA RÍO FRÍO'
  ],
  BARRIOS: [...sitiosFlori.values()].sort((a,b)=>a.localeCompare(b,'es')),
  CATALOGO_AMPLIADO:catalogoMunicipalFlori?.registros||[],
  SECTORES_RURALES:catalogoMunicipalFlori?.rurales||[],
  ASENTAMIENTOS_RURALES:catalogoMunicipalFlori?.asentamientosRurales||[],
  FUENTE_TERRITORIO:catalogoMunicipalFlori?.fuente||'Mapas de 2016'
});
