// ==========================================
// 1. CONFIGURACIÓN INICIAL Y MAPA
// ==========================================

const TULUA_COORDS = [4.0847, -76.1953]; // [Lat, Lng] de Tuluá (Base Central)
const RADIO_INTERMUNICIPAL_KM = 100; // Límite para intermunicipales

// Inicializar el mapa de Leaflet centrado en Tuluá
const map = L.map('map', {
  zoomControl: false
}).setView(TULUA_COORDS, 13);

// Capa de mapa limpia con OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

// Marcador principal (Origen)
const markerOrigen = L.marker(TULUA_COORDS, { draggable: true }).addTo(map);
markerOrigen.bindPopup("<b>📍 Tuluá (Base Central)</b>").openPopup();

let routeLayer = null;


// ==========================================
// 2. INTERACTIVIDAD Y CAMPOS DINÁMICOS
// ==========================================
const serviceCards = document.querySelectorAll('.service-card');
let servicioSeleccionado = 'comida';

serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    serviceCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    
    servicioSeleccionado = card.getAttribute('data-service');
    actualizarCamposSegunServicio(servicioSeleccionado);
  });
});

function actualizarCamposSegunServicio(servicio) {
  const lblOrigen = document.getElementById('lblOrigen');
  const lblDestino = document.getElementById('lblDestino');
  const grupoDestinoContainer = document.getElementById('grupoDestinoContainer');
  const extrasContainer = document.getElementById('extrasServicioContainer');
  
  extrasContainer.innerHTML = '';
  extrasContainer.style.display = 'none';
  grupoDestinoContainer.style.display = 'block';

  if (servicio === 'intermunicipal') {
    map.setView(TULUA_COORDS, 10);
  } else {
    map.setView(TULUA_COORDS, 13);
  }

  if (servicio === 'consignacion') {
    grupoDestinoContainer.style.display = 'none'; 
    lblOrigen.textContent = "📍 Barrio o Corregimiento de Recogida en Tuluá:";
    
    extrasContainer.style.display = 'block';
    extrasContainer.innerHTML = `
      <div class="input-group" style="margin-bottom: 0;">
        <label>💵 Cantidad a Consignar (Tarifa justa):</label>
        <input type="number" id="valorConsignacionInput" placeholder="Ej: 150000">
      </div>
    `;
  } else if (servicio === 'carrera') {
    lblOrigen.textContent = "📍 Barrio o Corregimiento de recogida:";
    lblDestino.textContent = "🏁 Barrio o Corregimiento de destino:";
  } else if (servicio === 'favor') {
    lblOrigen.textContent = "📍 Barrio o Corregimiento donde se realiza el favor:";
    lblDestino.textContent = "🏁 Barrio o Corregimiento de entrega:";
  } else if (servicio === 'intermunicipal') {
    lblOrigen.textContent = "📍 Origen (Tuluá o Municipio base):";
    lblDestino.textContent = "🏁 Destino (Municipio dentro de los 100km):";
  } else {
    lblOrigen.textContent = "📍 Barrio o Corregimiento de Recogida:";
    lblDestino.textContent = "🏁 Barrio o Corregimiento de Entrega:";
  }
}


// ==========================================
// 3. CONTROL DE MODALES
// ==========================================
const btnHacerPedido = document.getElementById('btnHacerPedido');
const modalPedido = document.getElementById('modalPedido');

if (btnHacerPedido) {
  btnHacerPedido.addEventListener('click', () => {
    modalPedido.style.display = 'flex';
  });
}

window.cerrarModal = function(modalId) {
  document.getElementById(modalId).style.display = 'none';
};

window.abrirAuthModal = function(tipo) {
  alert(`Abriendo modal de ${tipo === 'login' ? 'Inicio de Sesión' : 'Registro'}`);
};


// ==========================================
// 4. DIRECTORIO OFICIAL DE BARRIOS Y CORREGIMIENTOS DE TULUÁ
// ==========================================

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

  // Corregimientos principales
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

// Función auxiliar para normalizar texto (quita tildes y pasa a minúsculas)
function normalizarTexto(texto) {
  if (!texto) return "";
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

const btnCalcular = document.getElementById('btnCalcular');
const resultBox = document.getElementById('resultBox');
const distanciaTxt = document.getElementById('distanciaTxt');
const precioTxt = document.getElementById('precioTxt');

if (btnCalcular) {
  btnCalcular.addEventListener('click', async () => {
    const inputOrigen = document.getElementById('origenInput');
    const inputDestino = document.getElementById('destinoInput');
    const inputValorConsig = document.getElementById('valorConsignacionInput');
    
    // Normalizar entradas del usuario para evitar errores por tildes o espacios
    const origenVal = normalizarTexto(inputOrigen.value);
    const destinoVal = normalizarTexto(inputDestino.value);
    const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;

    let distanciaKm = 3.0;
    let coordsOrigen = [...TULUA_COORDS];
    let coordsDestino = [4.09, -76.21];
    let destinoEncontrado = false;

    const textoBusqueda = servicioSeleccionado === 'consignacion' ? origenVal : destinoVal;

    // Búsqueda inteligente flexible para el Origen en Tuluá
    for (let zona in directorioTulua) {
      const zonaNorm = normalizarTexto(zona);
      if (origenVal.includes(zonaNorm) || zonaNorm.includes(origenVal)) {
        coordsOrigen = directorioTulua[zona];
        break;
      }
    }

    // Búsqueda inteligente flexible para el Destino en Tuluá
    for (let zona in directorioTulua) {
      const zonaNorm = normalizarTexto(zona);
      if (textoBusqueda.includes(zonaNorm) || zonaNorm.includes(textoBusqueda)) {
        coordsDestino = directorioTulua[zona];
        break;
      }
    }

    // Comprobar si se seleccionó un municipio regional (solo para intermunicipales)
    for (let key in destinosRegionales) {
      const keyNorm = normalizarTexto(key);
      if (textoBusqueda.includes(keyNorm) || origenVal.includes(keyNorm)) {
        distanciaKm = destinosRegionales[key].km;
        coordsDestino = destinosRegionales[key].coords;
        destinoEncontrado = true;
        break;
      }
    }

    // RESTRICCIÓN: Si NO es intermunicipal, bloquear si intentan salir de Tuluá
    if (servicioSeleccionado !== 'intermunicipal' && destinoEncontrado) {
      alert(`⚠️ Este servicio (${servicioSeleccionado.toUpperCase()}) opera ÚNICAMENTE dentro de Tuluá por barrios y corregimientos oficiales. Para viajes regionales, usa "Envíos Intermunicipales".`);
      return;
    }

    if (servicioSeleccionado === 'intermunicipal' && distanciaKm > RADIO_INTERMUNICIPAL_KM) {
      alert(`⚠️ El destino excede el perímetro máximo de cobertura regional (${RADIO_INTERMUNICIPAL_KM} km).`);
      return;
    }

    if (!destinoEncontrado && servicioSeleccionado === 'intermunicipal') {
      distanciaKm = 35;
      coordsDestino = [4.1667, -76.1833]; // Andalucía por defecto
    } else if (!destinoEncontrado) {
      distanciaKm = Math.min(Math.max((origenVal.length + destinoVal.length) % 5 + 1.5, 1.5), 7.0);
      if (servicioSeleccionado === 'consignacion') distanciaKm = 2.5;
    }

    // Limpiar capa de ruta anterior
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Petición OSRM para trazar ruta real
    try {
      const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordsOrigen[1]},${coordsOrigen[0]};${coordsDestino[1]},${coordsDestino[0]}?overview=full&geometries=geojson`;
      const response = await fetch(urlOSRM);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const rutaReal = data.routes[0];
        
        if (servicioSeleccionado !== 'consignacion' && !destinoEncontrado) {
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

    // ==========================================
    // CÁLCULO DE TARIFA
    // ==========================================
    let precioCalculado = 0;

    if (servicioSeleccionado === 'consignacion') {
      const domicilioBase = 4000;
      const comisionBaja = 800 + (montoConsignar * 0.002);
      precioCalculado = domicilioBase + comisionBaja;
      distanciaKm = 0;
    } else if (servicioSeleccionado === 'carrera') {
      const baseCarrera = 4000;
      const adicionalDistancia = distanciaKm * 700;
      precioCalculado = baseCarrera + adicionalDistancia;
      if (precioCalculado > 6500) precioCalculado = 6500;
    } else if (servicioSeleccionado === 'intermunicipal') {
      const tarifaBaseInter = 15000;
      const costoKmInter = 1000;
      precioCalculado = tarifaBaseInter + (distanciaKm * costoKmInter);
    } else {
      const baseUrbana = 4000;
      const adicionalKm = distanciaKm * 900; 
      precioCalculado = baseUrbana + adicionalKm;
      if (precioCalculado > 9000) precioCalculado = 9000;
    }

    precioCalculado = Math.round(precioCalculado);

    // Mostrar resultados
    distanciaTxt.textContent = distanciaKm > 0 ? distanciaKm.toFixed(1) : "Local";
    precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });

    // ==========================================
    // REINICIO SEGURO DE CAMPOS AL FINAL
    // ==========================================
    inputOrigen.value = '';
    inputDestino.value = '';
    if (inputValorConsig) inputValorConsig.value = '';
  });
  }
