// ==========================================
// MÓDULO DE MAPAS Y COORDENADAS (maps_coordinates.js)
// ==========================================

const TULUA_COORDS = [4.0847, -76.1953]; // Coordenadas centrales de Tuluá

// Inicializar el mapa de Leaflet
const map = L.map('map', {
  zoomControl: false
}).setView(TULUA_COORDS, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

const markerOrigen = L.marker(TULUA_COORDS, { draggable: true }).addTo(map);
markerOrigen.bindPopup("<b>📍 Tuluá (Base Central)</b>").openPopup();

let routeLayer = null;

// Directorio Oficial de Barrios y Destinos
const directorioTulua = {
  // Comuna 1
  "lomitas": [4.0890, -76.1980],
  "fatima": [4.0860, -76.2000],
  "villa del rio": [4.0820, -76.1930],
  "victoria": [4.0790, -76.1970],
  "san benito la rivera": [4.0760, -76.1900],
  "el jazmin": [4.0780, -76.1880],

  // Comuna 2
  "alvernia": [4.0880, -76.1910],
  "entre rios": [4.0850, -76.1890],

  // Comuna 3
  "villanueva": [4.0910, -76.2020],
  "santa rita del rio": [4.0930, -76.2050],
  "san antonio": [4.0840, -76.1960],
  "popular": [4.0810, -76.2100],
  "peñaranda": [4.0790, -76.2040],
  "morales": [4.0860, -76.1940],
  "las brisas": [4.0830, -76.1990],
  "la villa": [4.0950, -76.1960],
  "estambul": [4.0890, -76.1860],
  "el dorado": [4.0920, -76.1930],
  "el condor": [4.0940, -76.1970],
  "el bosque": [4.0870, -76.1850],
  "la inmaculada": [4.0900, -76.1830],
  "la santa cruz": [4.0920, -76.1810],

  // Comuna 4
  "tomas uribe uribe": [4.0770, -76.2010],
  "escobar": [4.0740, -76.1980],

  // Comuna 5
  "sajonia": [4.0920, -76.1980],
  "salesianos": [4.0800, -76.1920],
  "quintas de san felipe": [4.0750, -76.1870],
  "la bastilla": [4.0820, -76.1860],
  "el principe": [4.0770, -76.1850],
  "doce de octubre": [4.0730, -76.1910],
  "avenida cali": [4.0710, -76.1940],
  "las acacias": [4.0700, -76.1850],

  // Comuna 6
  "primero de mayo": [4.0670, -76.1980],
  "pueblo nuevo": [4.0690, -76.2010],
  "progresar": [4.0650, -76.1970],
  "las delicias": [4.0630, -76.1940],
  "la esperanza": [4.0650, -76.2000],
  "buenos aires": [4.0620, -76.1980],
  "simon bolivar": [4.0600, -76.1950],
  "marandua": [4.0580, -76.1920],

  // Comuna 7
  "la quinta": [4.0720, -76.2050],
  "villa del lago": [4.0700, -76.2080],
  "villa del sur": [4.0680, -76.2060],
  "villaliliana": [4.0660, -76.2030],
  "ruben cruz velez": [4.0740, -76.2080],
  "rojas": [4.0750, -76.2110],
  "nuevo farfan": [4.0640, -76.2050],
  "los olmos": [4.0620, -76.2020],
  "los guayacanes": [4.0600, -76.1990],
  "laureles": [4.0730, -76.2130],
  "las nieves": [4.0710, -76.2100],
  "las americas": [4.0690, -76.2070],
  "la campiña": [4.0670, -76.2040],
  "jose antonio galan": [4.0650, -76.2010],
  "farfan": [4.0630, -76.1980],
  "el porvenir": [4.0610, -76.1960],
  "el limonar": [4.0590, -76.1930],
  "el descanso": [4.0570, -76.1900],
  "departamental": [4.0550, -76.1880],

  // Comuna 8
  "tercer milenio": [4.0530, -76.1850],
  "sintra san carlos": [4.0510, -76.1830],
  "santa isabel": [4.0490, -76.1810],
  "santa ines": [4.0470, -76.1790],
  "san luis": [4.0450, -76.1770],
  "municipal": [4.0430, -76.1750],
  "multifamiliares san luis": [4.0440, -76.1760],
  "los chiminangos": [4.0900, -76.2120],
  "la independencia": [4.0410, -76.1730],
  "flor de la campana": [4.0390, -76.1710],
  "el refugio": [4.0370, -76.1690],
  "portal de rio paila": [4.0350, -76.1670],
  "bosques de macaibo": [4.0330, -76.1650],

  // Comuna 9
  "alameda": [4.0820, -76.1900],
  "la trinidad": [4.0720, -76.2080],
  "la graciela": [4.0750, -76.2020],
  "el palmar": [4.0730, -76.1990],
  "villacolombia": [4.0710, -76.1960],
  "siete de agosto": [4.0680, -76.1950],
  "saman del norte": [4.0660, -76.1920],
  "rio paila": [4.0640, -76.1890],
  "portales del rio": [4.0620, -76.1870],
  "maracaibo": [4.0600, -76.1850],
  "juan xxiii": [4.0580, -76.1820],
  "internacional": [4.0560, -76.1800],
  "el jardin": [4.0540, -76.1780],
  "el bosquesito": [4.0520, -76.1760],
  "diablos rojos": [4.0500, -76.1740],

  // Corregimientos
  "aguaclara": [4.1200, -76.2500],
  "barragan": [4.1500, -76.0500],
  "bocas de tulua": [4.1300, -76.1200],
  "campoalegre": [4.1100, -76.1500],
  "el picacho": [4.1400, -76.1100],
  "el retiro": [4.1000, -76.1600],
  "la diadema": [4.0900, -76.2300],
  "la iberia": [4.0800, -76.2400],
  "la marina": [4.1600, -76.1000],
  "la palmera": [4.1150, -76.1400],
  "la moralia": [4.1250, -76.1300],
  "los caimos": [4.1050, -76.1700],
  "mateguadua": [4.0700, -76.2200],
  "monteloro": [4.1700, -76.0800],
  "puerto frazadas": [4.1800, -76.0700],
  "quebradagrande": [4.1550, -76.0900],
  "san lorenzo": [4.1450, -76.1150],
  "san rafael": [4.1350, -76.1250],
  "santa lucia": [4.1250, -76.1350],
  "tochecito": [4.1150, -76.1450],
  "venus": [4.1050, -76.1550],
  "piedritas": [4.0950, -76.1650],
  "centro": [4.0847, -76.1953]
};

const destinosRegionales = {
  "buga": { km: 28, coords: [3.9008, -76.3045] },
  "andalucia": { km: 10, coords: [4.1667, -76.1833] },
  "bugalagrande": { km: 17, coords: [4.2250, -76.1264] },
  "san pedro": { km: 36, coords: [3.9833, -76.2333] },
  "zarzal": { km: 41, coords: [4.3931, -76.0681] },
  "sevilla": { km: 53.5, coords: [4.2681, -75.9325] },
  "caicedonia": { km: 64, coords: [4.3333, -75.8500] },
  "la paila": { km: 46, coords: [4.3500, -76.1000] },
  "obando": { km: 70, coords: [4.4667, -75.7667] },
  "cartago": { km: 87, coords: [4.7269, -75.9175] },
  "armenia": { km: 94, coords: [4.5339, -75.6811] },
  "pereira": { km: 99, coords: [4.8133, -75.6961] }
};

function normalizarTexto(texto) {
  if (!texto) return "";
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// Función global que calcula la ruta y se comunica con OSRM
async function calcularRutaYMapa(origenTexto, destinoTexto, servicioSeleccionado) {
  let distanciaKm = 3.0;
  let coordsOrigen = null;
  let coordsDestino = null;

  const textoVerificacionDestino = servicioSeleccionado === 'consignacion' ? origenTexto : destinoTexto;

  // Validar Origen
  const origenNorm = normalizarTexto(origenTexto);
  if (directorioTulua[origenNorm]) {
    coordsOrigen = directorioTulua[origenNorm];
  } else {
    throw new Error(`El barrio o corregimiento de origen ("${origenTexto}") no está registrado en Tuluá.`);
  }

  // Validar Destino
  if (servicioSeleccionado === 'intermunicipal') {
    const destinoNorm = normalizarTexto(textoVerificacionDestino);
    if (destinosRegionales[destinoNorm]) {
      distanciaKm = destinosRegionales[destinoNorm].km;
      coordsDestino = destinosRegionales[destinoNorm].coords;
    } else {
      throw new Error(`El municipio de destino no está en la cobertura regional permitida.`);
    }
  } else if (servicioSeleccionado === 'consignacion') {
    coordsDestino = coordsOrigen;
  } else {
    const destinoNorm = normalizarTexto(textoVerificacionDestino);
    if (directorioTulua[destinoNorm]) {
      coordsDestino = directorioTulua[destinoNorm];
    } else {
      throw new Error(`El barrio o corregimiento de destino ("${destinoTexto}") no está registrado en Tuluá.`);
    }
  }

  // Limpiar capa de ruta anterior
  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  // Petición OSRM
  try {
    const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordsOrigen[1]},${coordsOrigen[0]};${coordsDestino[1]},${coordsDestino[0]}?overview=full&geometries=geojson`;
    const response = await fetch(urlOSRM);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const rutaReal = data.routes[0];
      
      if (servicioSeleccionado !== 'consignacion' && servicioSeleccionado !== 'intermunicipal') {
        distanciaKm = Math.max(rutaReal.distance / 1000, 1.5);
      }
      
      routeLayer = L.geoJSON(rutaReal.geometry, {
        style: { color: '#00ff88', weight: 5, opacity: 0.8 }
      }).addTo(map);

      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    } else {
      throw new Error();
    }
  } catch (error) {
    routeLayer = L.polyline([coordsOrigen, coordsDestino], {
      color: '#00ff88', weight: 4, dashArray: '6, 6'
    }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
  }

  return distanciaKm;
}

function ajustarZoomMapa(servicio) {
  if (servicio === 'intermunicipal') {
    map.setView(TULUA_COORDS, 10);
  } else {
    map.setView(TULUA_COORDS, 13);
  }
    }
