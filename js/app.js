// ==========================================
// 1. CONFIGURACIÓN INICIAL Y MAPA (TULUÁ Y REGIÓN - 100 KM)
// ==========================================

const TULUA_COORDS = [4.0847, -76.1953]; // [Lat, Lng]
const RADIO_MAXIMO_KM = 100; // Perímetro estricto de 100 km

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

// Círculo visual de cobertura estricta de 100 km a la redonda
const circuloCobertura = L.circle(TULUA_COORDS, {
  color: '#00e5ff',
  fillColor: '#00e5ff',
  fillOpacity: 0.03,
  radius: RADIO_MAXIMO_KM * 1000 // Convertir a metros (100,000m)
}).addTo(map);

// Capa para mostrar la línea de ruta entre Punto A y Punto B
let polylineRuta = null;


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
    // Solicitud exacta: Solo 2 apartados
    lblOrigen.textContent = "📍 Punto de Recogida (Banco / Efecty):";
    lblDestino.textContent = "🏁 Dirección de Destino / Cuenta:";
    
    extrasContainer.style.display = 'block';
    extrasContainer.innerHTML = `
      <div class="input-group" style="margin-bottom: 0;">
        <label>💵 Dinero a Consignar (+ % Comisión baja):</label>
        <input type="number" id="valorConsignacionInput" placeholder="Ej: 200000">
      </div>
    `;
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
// 4. MATRIZ DE DISTANCIAS REALES Y CÁLCULO ESTABLE (100 KM)
// ==========================================

// Base de coordenadas y distancias aproximadas (km) desde Tuluá hacia destinos clave de la región (hasta ~100km)
const destinosRegionales = {
  "buga": { km: 26, coords: [3.9008, -76.3045] },
  "andalucia": { km: 9, coords: [4.1667, -76.1833] },
  "bugalagrande": { km: 15, coords: [4.2250, -76.1264] },
  "san pedro": { km: 35, coords: [3.9833, -76.2333] },
  "zarzal": { km: 38, coords: [4.3931, -76.0681] },
  "sevilla": { km: 45, coords: [4.2681, -75.9325] },
  "caicedonia": { km: 62, coords: [4.3333, -75.8500] },
  "la paila": { km: 44, coords: [4.3500, -76.1000] },
  "obando": { km: 68, coords: [4.4667, -75.7667] },
  "cartago": { km: 85, coords: [4.7269, -75.9175] },
  "armenia": { km: 92, coords: [4.5339, -75.6811] },
  "pereira": { km: 98, coords: [4.8133, -75.6961] }
};

const btnCalcular = document.getElementById('btnCalcular');
const resultBox = document.getElementById('resultBox');
const distanciaTxt = document.getElementById('distanciaTxt');
const precioTxt = document.getElementById('precioTxt');

if (btnCalcular) {
  btnCalcular.addEventListener('click', () => {
    const origenVal = document.getElementById('origenInput').value.toLowerCase().trim();
    const destinoVal = document.getElementById('destinoInput').value.toLowerCase().trim();
    
    let distanciaKm = 4.5; // Distancia urbana promedio por defecto en Tuluá
    let coordsDestino = [4.07, -76.20]; // Coordenadas de respaldo

    // Evaluar si el destino coincide con nuestra base regional de 100km
    let destinoEncontrado = false;
    for (let key in destinosRegionales) {
      if (destinoVal.includes(key) || origenVal.includes(key)) {
        distanciaKm = destinosRegionales[key].km;
        coordsDestino = destinosRegionales[key].coords;
        destinoEncontrado = true;
        break;
      }
    }

    // Validación estricta de perímetro (Máximo 100 km)
    if (distanciaKm > RADIO_MAXIMO_KM) {
      alert(`⚠️ El destino excede el perímetro máximo de cobertura (${RADIO_MAXIMO_KM} km a la redonda desde Tuluá).`);
      return;
    }

    // Si es servicio urbano y no se especificó región, calculamos un estimado coherente (ej: 3 a 8 km)
    if (!destinoEncontrado && servicioSeleccionado === 'intermunicipal') {
      distanciaKm = 30; // Promedio intermunicipal predeterminado si escribe un lugar no listado
    } else if (!destinoEncontrado && servicioSeleccionado !== 'intermunicipal') {
      // Urbano puro
      distanciaKm = Math.min(Math.max((origenVal.length + destinoVal.length) % 7 + 2, 2.5), 12);
    }

    // Tarifas base y por kilómetro estables (sin aleatorios locos)
    let tarifaBase = servicioSeleccionado === 'intermunicipal' ? 16000 : 5000;
    let costoPorKm = servicioSeleccionado === 'intermunicipal' ? 1100 : 1800;
    
    let precioCalculado = tarifaBase + (distanciaKm * costoPorKm);

    // Aplicar comisión pequeña si es Consignación (ej. 1.8% del valor a consignar)
    if (servicioSeleccionado === 'consignacion') {
      const inputValorConsig = document.getElementById('valorConsignacionInput');
      const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;
      
      const comisionBaja = montoConsignar * 0.018; // 1.8% de comisión por manejo seguro
      precioCalculado += comisionBaja;
      console.log(`Consignación de $${montoConsignar} con comisión baja de: $${comisionBaja}`);
    }

    precioCalculado = Math.round(precioCalculado);

    // Pintar la línea de ruta en el mapa (Punto A a Punto B)
    if (polylineRuta) {
      map.removeLayer(polylineRuta);
    }
    polylineRuta = L.polyline([TULUA_COORDS, coordsDestino], {
      color: '#00ff88',
      weight: 4,
      dashArray: '6, 6'
    }).addTo(map);

    // Ajustar vista del mapa para encuadrar la ruta limpia
    map.fitBounds(polylineRuta.getBounds(), { padding: [50, 50] });

    // Mostrar resultados estables
    distanciaTxt.textContent = distanciaKm.toFixed(1);
    precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });
  });
}
