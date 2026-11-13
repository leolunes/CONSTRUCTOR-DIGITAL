/*
 * Puntos de orientación visual sobre el plano de barrios de Floridablanca (2016).
 * NO son coordenadas GIS ni delimitaciones oficiales. Los nombres de conjuntos
 * se orientan hacia el barrio principal (o, cuando falta, la comuna) del catálogo.
 * El usuario puede guardar después su propia posición exacta sobre la imagen.
 * Las coordenadas son porcentajes del ancho/alto de la imagen original completa.
 */
(()=>{
  'use strict';
  const barrios={
    'Abadías':[75.5,88.2],
    'Altamira':[70.8,77.4],
    'La Ronda':[69.3,89.1],
    'Limoncito':[75.1,73.5],
    'Los Andes':[72.8,81.9],
    'Casco Antiguo':[62.6,83.3],
    'Florida':[55.1,77.7],
    'Paraguitas':[60.2,71.8],
    'Sena':[51.0,75.0],

    'Cañaveral Occidental':[19.2,66.8],
    'Cañaveral':[33.7,67.0],
    'Cañaveral Oriental':[41.2,67.1],
    'Versalles':[40.8,78.6],
    'Aranzoque':[35.4,87.1],
    'Buenos Aires':[58.0,90.4],
    'La Paz':[51.6,87.7],
    'Campestre':[23.5,77.9],

    'Bucárica':[65.1,61.6],
    'Caracolí':[70.4,62.2],

    'Caldas':[38.4,18.7],
    'El Reposo':[54.1,23.3],
    'Fátima':[42.9,11.1],
    'La Trinidad':[51.0,8.3],
    'Zapamanga':[44.4,24.4],

    'El Bosque':[31.0,59.5],
    'Molinos':[34.2,44.2],
    'Palomitas':[27.8,49.5],
    'Niza':[33.9,35.2],
    'Trinitarios':[30.2,39.7],

    'Bellavista':[51.0,55.5],
    'Lagos':[43.0,58.0],

    'Santa Ana':[44.5,49.4],
    'Villabel':[39.3,49.9],

    'El Carmen':[60.0,49.1],
    'La Cumbre':[59.8,47.2],
    'La Hacienda':[52.3,35.7],

    // Denominaciones anteriores cuya correspondencia es reconocible en el plano.
    'Panquitas':[59.8,70.8],

    // Recuadro específico de Ruitoque Condominio, esquina superior izquierda.
    'Ruitoque Condominio':[15.1,29.8],
    'Mirador del Oriente (Ruitoque Condominio)':[12.6,24.1],
    'La Rinconada (Ruitoque Condominio)':[9.7,27.9],
    'Monterreal (Ruitoque Condominio)':[13.0,26.1],
    'La Lomita (Ruitoque Condominio)':[15.2,29.0],
    'La Aldea (Ruitoque Condominio)':[17.1,31.0],
    'La Bahía (Ruitoque Condominio)':[18.6,35.0],
    'Náutica (Ruitoque Condominio)':[16.2,37.2],
    'Lago Costa Norte (Ruitoque Condominio)':[19.2,39.0],
    'La Montaña (Ruitoque Condominio)':[16.5,29.2],
    'La Pradera (Ruitoque Condominio)':[13.6,37.0]
  };
  const comunas={
    1:[66.7,79.4],2:[35.0,75.7],3:[67.5,61.3],4:[46.1,21.8],
    5:[30.3,48.2],6:[46.2,59.3],7:[43.1,50.9],8:[59.2,48.8]
  };
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
  const alias={
    'Altos de Cañaveral':'Cañaveral',
    'Bosques de Cañaveral':'Cañaveral',
    'Estancia':'Florida',
    'Floridablanca Centro':'Casco Antiguo',
    'Los Molinos':'Molinos',
    'Parques de la Florida':'Florida',
    'Portal de Santa Ana':'Santa Ana',
    'Villa Luz':'El Reposo'
  };
  window.FLORIDABLANCA_UBICACIONES_REFERENCIA=Object.freeze({
    barrios:Object.fromEntries(Object.entries(barrios).map(([k,v])=>[norm(k),v])),
    aliases:Object.fromEntries(Object.entries(alias).map(([k,v])=>[norm(k),norm(v)])),
    comunas,
    // Panel de leyendas, FUERA del territorio cartografiado: para nombres
    // antiguos sin correspondencia confirmable sobre el plano de 2016.
    pendientes:[88.1,51.2],
    version:'orientacion-visual-v1.0.4',
    advertencia:'Ubicación orientativa sobre el mapa de 2016; no es coordenada geográfica precisa.'
  });
})();
