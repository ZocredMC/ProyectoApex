// ==========================================
// 1. CONFIGURACIÓN INICIAL Y MAPA
// ==========================================

const TULUA_COORDS = [4.0847, -76.1953]; // [Lat, Lng] de Tuluá (Base Central)
const RADIO_URBANO_MAX_KM = 12; // Límite máximo razonable dentro del casco urbano de Tuluá
const RADIO_INTERMUNICIPAL_KM = 100; // Límite para intermunicipales

// Inicializar el mapa de Leaflet centrado en Tuluá
const map = L.map('map', {
  zoomControl: false
}).setView(TULUA_COORDS, 13); // Zoom urbano por defecto

// Capa de mapa limpia con OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

// Marcador principal (Origen)
const markerOrigen = L.marker(TULUA_COORDS, { draggable: true }).addTo(map);
markerOrigen.bindPopup("<b>📍 Tuluá (Base Central)</b>").openPopup();

// Capa para mostrar la ruta real en el mapa
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

  // Cambiar la vista del mapa según el servicio seleccionado
  if (servicio === 'intermunicipal') {
    map.setView(TULUA_COORDS, 10); // Vista más abierta para región (100km)
  } else {
    map.setView(TULUA_COORDS, 13); // Vista urbana cerrada para Tuluá
  }

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
    lblOrigen.textContent = "📍 ¿Dónde se recoge al pasajero en Tuluá?:";
    lblDestino.textContent = "🏁 ¿Hacia dónde se dirige en Tuluá?:";
  } else if (servicio === 'favor') {
    lblOrigen.textContent = "📍 ¿Dónde se compra o realiza el favor en Tuluá?:";
    lblDestino.textContent = "🏁 ¿A dónde se entrega en Tuluá?:";
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
// 4. MATRIZ REGIONAL Y CÁLCULO DE TARIFA CON RESTRICCIÓN
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
    const inputOrigen = document.getElementById('origenInput');
    const inputDestino = document.getElementById('destinoInput');
    
    const origenVal = inputOrigen.value.toLowerCase().trim();
    const destinoVal = inputDestino.value.toLowerCase().trim();
    
    let distanciaKm = 3.0;
    let coordsDestino = [4.09, -76.21]; // Coordenada interna variable dentro de Tuluá para simular rutas urbanas distintas
    let destinoEncontrado = false;

    const textoBusqueda = servicioSeleccionado === 'consignacion' ? origenVal : destinoVal;

    // Verificar si se seleccionó un destino regional
    for (let key in destinosRegionales) {
      if (textoBusqueda.includes(key) || origenVal.includes(key)) {
        distanciaKm = destinosRegionales[key].km;
        coordsDestino = destinosRegionales[key].coords;
        destinoEncontrado = true;
        break;
      }
    }

    // REGLA CLAVE: Si NO es intermunicipal, BLOQUEAR si intentan salir de Tuluá
    if (servicioSeleccionado !== 'intermunicipal' && destinoEncontrado) {
      alert(`⚠️️ Este servicio (${servicioSeleccionado.toUpperCase())} es ÚNICAMENTE dentro de Tuluá. Para viajes a otros municipios, selecciona "Envíos Intermunicipales".`);
      return;
    }

    // Si es intermunicipal y excede los 100km
    if (servicioSeleccionado === 'intermunicipal' && distanciaKm > RADIO_INTERMUNICIPAL_KM) {
      alert(`⚠️ El destino excede el perímetro máximo de cobertura regional (${RADIO_INTERMUNICIPAL_KM} km).`);
      return;
    }

    // Si es servicio urbano y no se escribió un municipio regional, calculamos distancia interna basada en caracteres con variación real
    if (!destinoEncontrado && servicioSeleccionado === 'intermunicipal') {
      distanciaKm = 35; // Predeterminado intermunicipal genérico
      coordsDestino = [4.1667, -76.1833]; // Andalucía por defecto
    } else if (!destinoEncontrado) {
      // Cálculo urbano interno alejado del centro para que dibuje ruta real en Tuluá
      const variacionLat = (origenVal.length % 5) * 0.008 + 0.01;
      const variacionLng = (destinoVal.length % 5) * 0.008 + 0.01;
      coordsDestino = [TULUA_COORDS[0] + variacionLat, TULUA_COORDS[1] - variacionLng];
      
      // Distancia estimada urbana coherente entre 1.5 km y 7.5 km
      distanciaKm = Math.min(Math.max((origenVal.length + destinoVal.length) % 5 + 1.8, 1.8), 7.5);
      if (servicioSeleccionado === 'consignacion') distanciaKm = 2.5;
    }

    // Limpiar capa de ruta anterior
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Petición OSRM robusta y limpia con manejo de errores para evitar bloqueos
    try {
      const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${TULUA_COORDS[1]},${TULUA_COORDS[0]};${coordsDestino[1]},${coordsDestino[0]}?overview=full&geometries=geojson`;
      const response = await fetch(urlOSRM);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const rutaReal = data.routes[0];
        
        // Si no es intermunicipal ni consignación fija, usamos los metros que arroje OSRM convertidos a km
        if (servicioSeleccionado !== 'consignacion' && !destinoEncontrado) {
          distanciaKm = Math.max(rutaReal.distance / 1000, 1.5);
        }
        
        routeLayer = L.geoJSON(rutaReal.geometry, {
          style: { color: '#00ff88', weight: 5, opacity: 0.8 }
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
      } else {
        throw new Error("Ruta no encontrada por OSRM");
      }
    } catch (error) {
      console.warn("Usando respaldo de línea directa por fallo de red OSRM:", error);
      routeLayer = L.polyline([TULUA_COORDS, coordsDestino], {
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
      const inputValorConsig = document.getElementById('valorConsignacionInput');
      const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;
      const comisionBaja = 800 + (montoConsignar * 0.002);
      precioCalculado = domicilioBase + comisionBaja;
      distanciaKm = 0;
    } else if (servicioSeleccionado === 'carrera') {
      const baseCarrera = 4000;
      const adicionalDistancia = distanciaKm * 700;
      precioCalculado = baseCarrera + adicionalDistancia;
      if (precioCalculado > 6500) precioCalculado = 6500; // Tope máximo urbano para carreras
    } else if (servicioSeleccionado === 'intermunicipal') {
      const tarifaBaseInter = 15000;
      const costoKmInter = 1000;
      precioCalculado = tarifaBaseInter + (distanciaKm * costoKmInter);
    } else {
      // Comida, Paquetes, Favor (Urbano Tuluá)
      const baseUrbana = 4000;
      const adicionalKm = distanciaKm * 900; 
      precioCalculado = baseUrbana + adicionalKm;
      if (precioCalculado > 9000) precioCalculado = 9000; // Tope máximo urbano domicilios
    }

    precioCalculado = Math.round(precioCalculado);

    // Mostrar resultados en pantalla
    distanciaTxt.textContent = distanciaKm > 0 ? distanciaKm.toFixed(1) : "Local";
    precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });

    // ==========================================
    // REQUISITO 1: BORRAR Y REINICIAR CAMPOS EN 0
    // ==========================================
    inputOrigen.value = '';
    inputDestino.value = '';
    const inputValorConsig = document.getElementById('valorConsignacionInput');
    if (inputValorConsig) inputValorConsig.value = '';
  });
}
