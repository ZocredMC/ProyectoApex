// ==========================================
// 1. CONFIGURACIÓN INICIAL Y MAPA (TULUÁ Y REGIÓN - 100 KM)
// ==========================================

const TULUA_COORDS = [4.0847, -76.1953]; // [Lat, Lng]
const RADIO_MAXIMO_KM = 100;

// Inicializar el mapa de Leaflet centrado en Tuluá
const map = L.map('map', {
  zoomControl: false
}).setView(TULUA_COORDS, 10);

// Capa de mapa limpia con OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

// Marcador principal (Origen)
const markerOrigen = L.marker(TULUA_COORDS, { draggable: true }).addTo(map);
markerOrigen.bindPopup("<b>📍 Tuluá (Base Central)</b>").openPopup();

const circuloCobertura = L.circle(TULUA_COORDS, {
  color: '#00e5ff',
  fillColor: '#00e5ff',
  fillOpacity: 0.03,
  radius: RADIO_MAXIMO_KM * 1000
}).addTo(map);

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

  if (servicio === 'consignacion') {
    grupoDestinoContainer.style.display = 'none'; 
    lblOrigen.textContent = "📍 Punto de Recogida (Barrio / Banco en Tuluá):";
    
    extrasContainer.style.display = 'block';
    extrasContainer.innerHTML = `
      <div class="input-group" style="margin-bottom: 0;">
        <label>💵 Cantidad a Consignar (Tarifa justa):</label>
        <input type="number" id="valorConsignacionInput" placeholder="Ej: 150000">
      </div>
    `;
  } else if (servicio === 'carrera') {
    lblOrigen.textContent = "📍 ¿Dónde se recoge al pasajero?:";
    lblDestino.textContent = "🏁 ¿Hacia dónde se dirige?:";
  } else if (servicio === 'favor') {
    lblOrigen.textContent = "📍 ¿Dónde se compra o realiza el favor?:";
    lblDestino.textContent = "🏁 ¿A dónde se entrega?:";
  } else if (servicio === 'intermunicipal') {
    lblOrigen.textContent = "📍 Origen (Tuluá o Municipio base):";
    lblDestino.textContent = "🏁 Destino (Municipio dentro de los 100km):";
  } else {
    lblOrigen.textContent = "📍 Origen (Recogida en Tuluá):";
    lblDestino.textContent = "🏁 Destino (Entrega en Tuluá):";
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
// 4. MATRIZ REGIONAL Y CÁLCULO DE TARIFA
// ==========================================

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

const btnCalcular = document.getElementById('btnCalcular');
const resultBox = document.getElementById('resultBox');
const distanciaTxt = document.getElementById('distanciaTxt');
const precioTxt = document.getElementById('precioTxt');

if (btnCalcular) {
  btnCalcular.addEventListener('click', async () => {
    const origenVal = document.getElementById('origenInput').value.toLowerCase().trim();
    const destinoVal = document.getElementById('destinoInput').value.toLowerCase().trim();
    
    let distanciaKm = 3.0;
    let coordsDestino = [4.07, -76.20];
    let destinoEncontrado = false;

    const textoBusqueda = servicioSeleccionado === 'consignacion' ? origenVal : destinoVal;

    for (let key in destinosRegionales) {
      if (textoBusqueda.includes(key) || origenVal.includes(key)) {
        distanciaKm = destinosRegionales[key].km;
        coordsDestino = destinosRegionales[key].coords;
        destinoEncontrado = true;
        break;
      }
    }

    if (distanciaKm > RADIO_MAXIMO_KM) {
      alert(`⚠️ El destino excede el perímetro máximo de cobertura (${RADIO_MAXIMO_KM} km).`);
      return;
    }

    if (!destinoEncontrado && servicioSeleccionado === 'intermunicipal') {
      distanciaKm = 35;
    } else if (!destinoEncontrado && servicioSeleccionado !== 'intermunicipal' && servicioSeleccionado !== 'consignacion') {
      distanciaKm = Math.min(Math.max((origenVal.length + destinoVal.length) % 5 + 1.5, 1.5), 7.5);
    }

    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    try {
      const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${TULUA_COORDS[1]},${TULUA_COORDS[0]};${coordsDestino[1]},${coordsDestino[0]}?overview=full&geometries=geojson`;
      const response = await fetch(urlOSRM);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const rutaReal = data.routes[0];
        distanciaKm = servicioSeleccionado === 'consignacion' ? 2.5 : (rutaReal.distance / 1000);
        
        routeLayer = L.geoJSON(rutaReal.geometry, {
          style: { color: '#00ff88', weight: 5, opacity: 0.8 }
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      } else {
        throw new Error();
      }
    } catch (error) {
      routeLayer = L.polyline([TULUA_COORDS, coordsDestino], {
        color: '#00ff88', weight: 4, dashArray: '6, 6'
      }).addTo(map);
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    }

    // ==========================================
    // CÁLCULO DE TARIFA SEGÚN TIPO DE SERVICIO
    // ==========================================
    let precioCalculado = 0;

    if (servicioSeleccionado === 'consignacion') {
      const domicilioBase = 4000;
      const inputValorConsig = document.getElementById('valorConsignacionInput');
      const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;
      const comisionBaja = 800 + (montoConsignar * 0.002);
      precioCalculado = domicilioBase + comisionBaja;
      distanciaKm = 0;
    } else if (servicioSeleccionado === 'carrera') {
      // REQUISITO CARRERAS: Mínima $4.000, punto más retirado $5.000 - $6.000, directo sin esperas
      const baseCarrera = 4000;
      const adicionalDistancia = distanciaKm * 700;
      precioCalculado = baseCarrera + adicionalDistancia;
      
      // Tope máximo lógico en zona urbana para carreras (entre $6,000 y $7,000)
      if (precioCalculado > 6500) {
        precioCalculado = 6500;
      }
    } else if (servicioSeleccionado === 'intermunicipal') {
      const tarifaBaseInter = 15000;
      const costoKmInter = 1000;
      precioCalculado = tarifaBaseInter + (distanciaKm * costoKmInter);
    } else {
      // Domicilios normales (Comida, Paquetes, Favor)
      const baseUrbana = 4000;
      const adicionalKm = distanciaKm * 900; 
      precioCalculado = baseUrbana + adicionalKm;
      
      if (precioCalculado > 9000) {
        precioCalculado = 9000;
      }
    }

    precioCalculado = Math.round(precioCalculado);

    distanciaTxt.textContent = distanciaKm > 0 ? distanciaKm.toFixed(1) : "Local";
    precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });
  });
}
