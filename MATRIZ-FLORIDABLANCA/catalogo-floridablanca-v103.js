/*
 * Catálogo ampliado de la División Político-Administrativa de Floridablanca (2016).
 * Transcripción de las Tablas 1 y 2 del Plan de Desarrollo Municipal 2024–2027,
 * Secretaría de Planeación, páginas impresas 19–24 (PDF páginas 18–23).
 * https://www.amb.gov.co/download/38567/
 * Los nombres permiten buscar fichas; NO atribuyen coordenadas ni polígonos.
 * Las listas no sustituyen verificación de denominaciones o límites vigentes.
 */
(()=>{
  'use strict';
  const divide=s=>String(s||'').split('|').map(x=>x.trim()).filter(Boolean);
  // [Número de comuna, barrio principal, conjuntos/urbanizaciones separados por «|»]
  const GRUPOS=[
    [1,'Abadías','Abadías|Cracovia II'],
    [1,'Altamira','Altamira|Altamira I|Altamira II|Altamira III|El Refugio|Nogales de la Florida|Los Cedritos'],
    [1,'La Ronda','Cracovia I|La Ronda|Favuis'],
    [1,'Limoncito','Bosques de la Florida|Limoncito|Jardín de Limoncito'],
    [1,'Los Andes','Los Andes|Los Pirineos|Portal del Bosque'],
    [1,'Casco Antiguo','Casa Blanca|Casco Antiguo|Cooviflorida I|Florida Real|Miradores de la Florida|La Primavera I|Portal del Parque|Rosario Condominio|Rosario II|Torre Di Bari'],
    [1,'Florida','Acacias I|Acacias II|Bellomonte|Belford|Bonaparte|El Manantial|El Recreo|El Verde|Estancia Campestre|La Florida|Monteblanco|Paraguitas Campestre|Quintas de Florida|Portal de Castilla|Portal de la Sierra|Santa Coloma|Torres de Sevilla|Villas de San Francisco|Villa Italia|Villa Jardín|Villa Piedra del Sol'],
    [1,'Paraguitas','Paraguitas I|Paraguitas II|Paraguitas Real|Cooviflorida II'],
    [1,'Sena','Sena'],

    [2,'Cañaveral Occidental','Álamos Parque|Altos del Valle|Arawak|Baranoa|Club House I|Club House Gold|Club House II|Club House III|Condominio Parque Cañaveral|Gaira|Jardines del Campestre|Makadamia|Mirador del Valle|Reserva Cañaveral|Sierra Colina|Tamaca|Tayrona'],
    [2,'Cañaveral','Alameda Cañaveral|Altos de Cañaveral Campestre|Altos de Cañaveral I|Altos de Cañaveral II|Altos de Cañaveral III|Altos de Cañaveral IV|Altos de Cañaveral V|Altos de Cañaveral VI|Belhorizonte I|Belhorizonte II|Belhorizonte III|Belhorizonte IV|Belhorizonte V|Buganvilia|Camino Real|Cañaveral|Cañaveral Campestre I|Cañaveral Campestre II|Cañaveral Campestre III|Cañaveral Country|Cañaveral Plaza|Cerros de Cañaveral|Colina Campestre|Hoyo en Uno|Ibiza|Iroka|La Calleja Campestre|La Lomita|La Península|C.R La Península|La Pera|La Riviera|Medina del Campo|Montellano Campestre|Parque Central Cañaveral|Plazuela Cañaveral|Portal de Oviedo|Prados de Cañaveral|Quintas del Campestre|San Diego|Santa María de Cañaveral|Torres de Aragón|Torres de Cañaveral I|Torres de Cañaveral II|Torres del Club|Valterra|Villa Cañaveral'],
    [2,'Cañaveral Oriental','Cañaveral Lago Campestre|Cañaveral Oriental|Cañaveral Panamericano|Florida del Country|Hacienda Cañaveral|Redil del Country|Torres del Lago|Town Houses'],
    [2,'Versalles','Ciudadela Comfenalco|Colina Versalles|Jardín de Versalles|Mirador de Versalles|Pinar de Versalles|Quintas de Cañaveral|Versalles I|Versalles II|Versalles Campestre|Versalles Real|Villa Margarita'],
    [2,'Aranzoque','Altos de Aranjuez|El Olympo|González Chaparro|Mediterránea|Mediterrane Royal|Montevechio|Portal Siglo XXI|Park 200|Prados de Laurentia|Torino 200|Valmonti'],
    [2,'Buenos Aires','Colina Ruitoque'],
    [2,'La Paz','Baviera|Bosques de Baviera|Brisas de Florida|Ciudadela de los Príncipes|La Paz|Villa Claver|Villa San Diego|Villa Yolanda'],
    [2,'Campestre','Club Campestre|Natura'],

    [3,'Bucárica','Bucarica|Bucarica IV|C.R Cipreses'],
    [3,'Caracolí','Altos de Caracolí|Caracolí|Villa Coram'],

    [4,'Caldas','Altoviento I|Altoviento II|Aranjuez|Bellavista Casas|Caldas|C.R La Castellana|El Dorado|Palmas de la Frontera|Tenza|Torres del Bicentenario|Torres del Vivero'],
    [4,'El Reposo','Arias Rubio|Balcón de Alares|Balcones del Reposo|Cerros de Villaluz|Ciudad Jardín|El Jordán|El Oasis|El Reposo|José A. Morales|Las Villas|Los Alares|Los Robles|Miradores del Reposo|Santa Helena|Santa Helena del Campo|Santa Helena Baviera|Santa Helena de la Sierra|Tribuna del Reposo|Villaluz'],
    [4,'Fátima','Altos de la Pradera|Balcones de la Colina|Fátima|Mirador de Fátima|Prados de Fátima|Puerto Varas|Tatika'],
    [4,'La Trinidad','Hacienda San Juan|La Trinidad|Los Arrayanes|San Bernardo'],
    [4,'Zapamanga','La Castellana|Santa Fe|Zapamanga I|Zapamanga II|Zapamanga III|Zapamanga IV|Zapamanga V|Zapamanga VI|Zapamanga VII'],

    [5,'El Bosque','El Bosque A|El Bosque B|El Bosque C|El Bosque D|El Bosque E|El Bosque F|El Bosque G|Villas del Mediterráneo'],
    [5,'Molinos','Andalucía|CR Andalucía|Colón|Carabelas|Molinos Altos|Molinos Bajos'],
    [5,'Palomitas','Altos del Campestre|Cerros del Campestre|La Zafra|Mirador del Campestre|Monticello|Palmar del Viento|Palmar del Campo|Parque San Agustín|Quintas del Palmar|San Ángel|Villa España|Villa Firenze|Villa Mallorca|Villa Tarragona|Vista Azul|Vista Azul Campestre|Paralela 150|Santelmo'],
    [5,'Niza','Bosques del Payador|Jardines de Niza|Guayacanes|La Florida Condominio|Niza|Palmas de Niza|Olmos del Payador|Santa Catalina|Torres de San Felipe'],
    [5,'Trinitarios','Arcos del Campestre|Condado del Campestre|Parque Campestre|Plaza Marsella|Portales del Campestre|Torres de Madeira|Trinitarios'],

    [6,'Bellavista','Altos de Bellavista|Balcones del Oriente|Bellavista|Panorama (Aptos)'],
    [6,'Lagos','Asovilagos|Lago Condominio|Lagos I|Lagos II|Lagos III|Lagos IV|Lagos V|Villa Natalia'],

    [7,'Santa Ana','Altos de Florida|Altos de Santana|Altos de Villabel|Buenavista|Escoflor|Hogar Altos de Santana|Los Alpes|Miradores de Santana|Portal de Santana|Prados del Sur|Santa Ana|Villa Helena|Villareal Sur'],
    [7,'Villabel','Ciudad Valencia|El Remanso|Guanatá|Los Rosales|Villabel|Nuevo Villabel|Los Oitties|Villa Montana'],

    [8,'El Carmen','El Carmen I|El Carmen II|El Carmen III|El Carmen IV|El Carmen V|El Carmen VI|Portal de Israel|Recodo de la Florida'],
    [8,'La Cumbre','Aguaclara|Asovicum|Aviter|Ciudad 2000|Corviuva|Cumbari|Juan Pablo II|La Cumbre|Las Granjas|Los Mangos|Miradores de Vallarta|Panorama|Pio XII|Portales de Jericó|Quintas de Santa Lucia|Rincón de la Cumbre|San Carlos|Suratoque|Villa Alcázar|Villa de la Cumbre|Villa Solar|Villa Tarel'],
    [8,'La Hacienda','Piemonti|Valverdi']
  ];

  // Asentamientos tal como aparecen en la columna correspondiente de la Tabla 2.
  // La tabla no los asigna a un barrio específico: solo a su comuna.
  const ASENTAMIENTOS={
    1:'Altos de Limoncito|Primavera II|Los Puentes',
    2:'Buenos Aires',
    4:'Asdeflor|Belencito|Cerros del Reposo|La Esmeralda|Los Laureles|Los Olivos|Palmeras I|Palmeras II|Robles Oriental|Santa Inés',
    5:'El Progreso',
    7:'La Semilla',
    8:'Asdesur I|Asdesur II|Asovisur I|Asovisur II|Brisas Florida|Ciudadela Campestre|Corpovisur I|Corpovisur II|El Páramo|El Santuario|García Echeverry|Jardines de Getsemaní|La Capilla|Miradores del Campo|Miradores de la Cumbre|Miradores de Florida|Portal de la Hacienda|Transuratoque|Villa Esperanza I|Villa Esperanza II'
  };

  // Ruitoque Condominio figura en un recuadro rural independiente del plano.
  // Se mantiene también el nombre general «Ruitoque Condominio», ya existente en la app.
  const CONDOMINIO_RUITOQUE='Mirador del Oriente|La Rinconada|Monterreal|La Lomita|La Aldea|La Bahía|Náutica|Lago Costa Norte|La Montaña|La Pradera';

  // [Corregimiento, vereda, sectores] de la Tabla 1 del mismo documento.
  const VEREDAS=[
    [1,'VEREDA ALSACIA','Malavar'],
    [1,'VEREDA CASIANO','La Sidra|Villa Guadalquivir|Montearroyo'],
    [1,'VEREDA GUAYANAS','Los Cauchos|Altos de Mantilla|Villa Edilia'],
    [1,'VEREDA HELECHALES','La Judía'],
    [2,'VEREDA AGUABLANCA','Buenavista|Rosablanca|San Ignacio|El Mortiño'],
    [2,'VEREDA VERICUTE','Las Despensas|Santa Bárbara'],
    [3,'VEREDA RUITOQUE','El Paramito|Mesa de Ruitoque|Nazaret|Nueva Bosconia|Ruitoque Condominio'],
    [3,'VEREDA RÍO FRÍO','El Verde|Valle de Ruitoque|La Hormiga']
  ];
  const ASENTAMIENTOS_RURALES=divide('Santa Bárbara|Villa San Pedro|Villa Leonor|Asocoflor|Brisas del Manantial|Asohelechales|Asomiflor|Altos Caracolí Oriental|Nuevo Tamboruco|El Chino');

  const registros=[];
  const key=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  const visto=new Map();
  function registrar(nombre,comuna,barrio,tipo,zona='urbana'){
    if(!nombre)return;
    const id=key(nombre);if(!id)return;
    const nuevo={nombre,comuna, barrio, tipo, zona};
    const anterior=visto.get(id);
    if(!anterior){registros.push(nuevo);visto.set(id,nuevo)}
    else if(tipo==='Barrio'&&anterior.tipo!=='Barrio')Object.assign(anterior,nuevo);
  }
  GRUPOS.forEach(([comuna,barrio,lista])=>{
    registrar(barrio,comuna,barrio,'Barrio');
    divide(lista).forEach(nombre=>registrar(nombre,comuna,barrio,'Conjunto o urbanización'));
  });
  Object.entries(ASENTAMIENTOS).forEach(([comuna,lista])=>divide(lista).forEach(nombre=>registrar(nombre,Number(comuna),'','Asentamiento')));
  registrar('Ruitoque Condominio',null,'','Centro poblado especial','rural');
  // Se antepone el condominio para distinguir sectores homónimos de los urbanos
  // (por ejemplo, «La Lomita» en la comuna 2 y en Ruitoque Condominio).
  divide(CONDOMINIO_RUITOQUE).forEach(nombre=>registrar(`${nombre} (Ruitoque Condominio)`,null,'Ruitoque Condominio','Sector de condominio','rural'));
  const rurales=VEREDAS.map(([corregimiento,vereda,lista])=>({
    corregimiento,vereda,sectores:divide(lista)
  }));
  window.FLORIDABLANCA_CATALOGO_EXTENDIDO=Object.freeze({
    version:'2024-2027-tablas-1-y-2',registros,rurales,
    asentamientosRurales:ASENTAMIENTOS_RURALES,
    grupos:GRUPOS.map(([comuna,barrio,lista])=>({comuna,barrio,conjuntos:divide(lista)})),
    normalize:key,
    fuente:'Plan de Desarrollo Floridablanca en Orden 2024–2027, tablas 1 y 2 (división de 2016)'
  });
})();
