// ==========================================
// 1. CONFIGURACIÓN INICIAL Y MAPA (TULUÁ Y REGIÓN)
// ==========================================

// Coordenadas centrales de Tuluá, Valle del Cauca
const TULUA_COORDS = [4.0847, -76.1953];

// Inicializar el mapa de Leaflet sin requerir API Keys
const map = L.map('map', {
  zoomControl: false
}).setView(TULUA_COORDS, 13);

// Capa de mapa limpia y gratuita (OpenStreetMap estándar sin tokens obligatorios)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map);

// Añadir marcador inicial en Tuluá
const marker = L.marker(TULUA_COORDS, { draggable: true }).addTo(map);
marker.bindPopup("<b>📍 Base principal - Tuluá</b>").openPopup();

// Círculo opcional para visualizar cobertura intermunicipal (~50km a la redonda orientativo)
let radioCobertura = null;


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
    console.log("Servicio seleccionado:", servicioSeleccionado);
    
    actualizarCamposSegunServicio(servicioSeleccionado);
  });
});

function actualizarCamposSegunServicio(servicio) {
  const lblOrigen = document.getElementById('lblOrigen');
  const lblDestino = document.getElementById('lblDestino');
  const grupoDestinoContainer = document.getElementById('grupoDestinoContainer');
  const extrasContainer = document.getElementById('extrasServicioContainer');
  
  // Limpiar extras previos
  extrasContainer.innerHTML = '';
  extrasContainer.style.display = 'none';
  grupoDestinoContainer.style.display = 'block';

  if (servicio === 'consignacion') {
    lblOrigen.textContent = "📍 Punto Bancario / Efecty (Recogida):";
    lblDestino.textContent = "🏁 Dirección de Destino / Cuenta:";
    
    // Inyectar campos específicos para consignación (Valor a consignar)
    extrasContainer.style.display = 'block';
    extrasContainer.innerHTML = `
      <div class="input-group" style="margin-bottom: 0;">
        <label>💵 Valor exacto a consignar / 
        <span style="color: var(--primary);">+ % comisión</span>:</label>
        <input type="number" id="valorConsignacionInput" placeholder="Ej: 150000">
      </div>
    `;
  } else if (servicio === 'favor') {
    lblOrigen.textContent = "📍 ¿Dónde se compra o realiza el favor?:";
    lblDestino.textContent = "🏁 ¿A dónde se entrega?:";
  } else if (servicio === 'intermunicipal') {
    lblOrigen.textContent = "📍 Origen (Tuluá / Municipio cercano):";
    lblDestino.textContent = "🏁 Destino (Municipio o Vereda aledaño):";
    
    // Ajustar vista del mapa para abarcar la zona de ~50km (Bugalagrande, Andalucía, San Pedro, Buga, Sevilla, etc.)
    map.setView(TULUA_COORDS, 10);
    if (!radioCobertura) {
      radioCobertura = L.circle(TULUA_COORDS, {
        color: '#00e5ff',
        fillColor: '#00e5ff',
        fillOpacity: 0.05,
        radius: 25000 // Radio visual orientativo en metros
      }).addTo(map);
    }
    radioCobertura.setStyle({ opacity: 1, fillOpacity: 0.05 });
    return;
  } else {
    lblOrigen.textContent = "📍 Origen (Recogida en Tuluá):";
    lblDestino.textContent = "🏁 Destino (Entrega en Tuluá):";
  }

  // Si no es intermunicipal, devolvemos el mapa al zoom urbano de Tuluá y ocultamos el radio
  map.setView(TULUA_COORDS, 13);
  if (radioCobertura) {
    radioCobertura.setStyle({ opacity: 0, fillOpacity: 0 });
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
// 4. CÁLCULO DE TARIFA CON COMISIÓN DE CONSIGNACIÓN
// ==========================================
const btnCalcular = document.getElementById('btnCalcular');
const resultBox = document.getElementById('resultBox');
const distanciaTxt = document.getElementById('distanciaTxt');
const precioTxt = document.getElementById('precioTxt');

if (btnCalcular) {
  btnCalcular.addEventListener('click', () => {
    let tarifaBase = 5000;
    let distanciaAleatoria = (Math.random() * 4 + 1.5).toFixed(1);

    // Ajustar tarifa si es intermunicipal (distancias mayores)
    if (servicioSeleccionado === 'intermunicipal') {
      distanciaAleatoria = (Math.random() * 30 + 10).toFixed(1); // Entre 10 y 40 km
      tarifaBase = 18000; // Tarifa base más alta para viajes por la región
    }

    const costoPorKm = servicioSeleccionado === 'intermunicipal' ? 1200 : 1800;
    let precioCalculado = tarifaBase + (distanciaAleatoria * costoPorKm);

    // Si es consignación, sumamos el porcentaje extra basado en el valor a consignar (ej. 2% de manejo de efectivo o base mínima)
    if (servicioSeleccionado === 'consignacion') {
      const inputValorConsig = document.getElementById('valorConsignacionInput');
      const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;
      
      // Ejemplo: 2.5% de comisión por manejo de dinero + riesgo
      const comisionDinero = montoConsignar * 0.025; 
      precioCalculado += comisionDinero;
      
      console.log(`Monto a consignar: $${montoConsignar} | Comisión aplicada: $${comisionDinero}`);
    }

    precioCalculado = Math.round(precioCalculado);

    // Mostrar resultados
    distanciaTxt.textContent = distanciaAleatoria;
    precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });
  });
}
