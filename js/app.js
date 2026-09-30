// ==========================================
// 1. CONFIGURACIÓN INICIAL Y MAPA (TULUÁ)
// ==========================================

// Coordenadas centrales de Tuluá, Valle del Cauca
const TULUA_COORDS = [4.0847, -76.1953];

// Inicializar el mapa de Leaflet
const map = L.map('map', {
  zoomControl: false // Quitamos el control por defecto para estilizarlo si queremos
}).setView(TULUA_COORDS, 14);

// Añadir capa oscura/futurista de mapa (CartoDB Dark Matter combina perfecto con el diseño)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Añadir marcador inicial en Tuluá
const marker = L.marker(TULUA_COORDS, { draggable: true }).addTo(map);
marker.bindPopup("<b>¡Tu ubicación en Tuluá!</b>").openPopup();


// ==========================================
// 2. INTERACTIVIDAD DE LAS TARJETAS DE SERVICIO
// ==========================================
const serviceCards = document.querySelectorAll('.service-card');
let servicioSeleccionado = 'comida'; // Servicio por defecto

serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    // Remover la clase active de todas las tarjetas
    serviceCards.forEach(c => c.classList.remove('active'));
    // Añadirla a la presionada
    card.classList.add('active');
    
    // Obtener el tipo de servicio seleccionado
    servicioSeleccionado = card.getAttribute('data-service');
    console.log("Servicio seleccionado:", servicioSeleccionado);
    
    // Aquí puedes adaptar dinámicamente textos o campos según el servicio si lo deseas
    actualizarCamposSegunServicio(servicioSeleccionado);
  });
});

function actualizarCamposSegunServicio(servicio) {
  const lblOrigen = document.getElementById('lblOrigen');
  const lblDestino = document.getElementById('lblDestino');
  
  if (servicio === 'consignacion') {
    lblOrigen.textContent = "📍 Punto Bancario / Efecty (Recogida):";
    lblDestino.textContent = "🏁 Dirección de Destino / Persona:";
  } else if (servicio === 'favor') {
    lblOrigen.textContent = "📍 ¿Dónde se compra o realiza el favor?:";
    lblDestino.textContent = "🏁 ¿A dónde se entrega?:";
  } else if (servicio === 'intermunicipal') {
    lblOrigen.textContent = "📍 Origen (Tuluá u otro municipio):";
    lblDestino.textContent = "🏁 Destino (Municipio / Vereda):";
  } else {
    lblOrigen.textContent = "📍 Origen (Recogida en Tuluá):";
    lblDestino.textContent = "🏁 Destino (Entrega en Tuluá):";
  }
}


// ==========================================
// 3. CONTROL DE MODALES Y BOTONES
// ==========================================

// Abrir modal de pedido (al hacer clic en "Confirmar y Solicitar")
const btnHacerPedido = document.getElementById('btnHacerPedido');
const modalPedido = document.getElementById('modalPedido');

if (btnHacerPedido) {
  btnHacerPedido.addEventListener('click', () => {
    modalPedido.style.display = 'flex';
  });
}

// Función global para cerrar modales (llamada desde el HTML o botones de cancelar)
window.cerrarModal = function(modalId) {
  document.getElementById(modalId).style.display = 'none';
};

// Funciones globales para el sistema de Auth (Login / Registro)
window.abrirAuthModal = function(tipo) {
  alert(`Abriendo modal de ${tipo === 'login' ? 'Inicio de Sesión' : 'Registro'} (Próximamente conectado con Supabase)`);
};


// ==========================================
// 4. SIMULACIÓN DE CÁLCULO DE TARIFA
// ==========================================
const btnCalcular = document.getElementById('btnCalcular');
const resultBox = document.getElementById('resultBox');
const distanciaTxt = document.getElementById('distanciaTxt');
const precioTxt = document.getElementById('precioTxt');

if (btnCalcular) {
  btnCalcular.addEventListener('click', () => {
    // Simulamos un cálculo rápido basado en distancias aleatorias o fijas para prueba
    const distanciaAleatoria = (Math.random() * 4 + 1.5).toFixed(1); // Entre 1.5 y 5.5 km
    const tarifaBase = 5000;
    const costoPorKm = 1800;
    const precioCalculado = Math.round(tarifaBase + (distanciaAleatoria * costoPorKm));

    // Mostrar resultados en pantalla
    distanciaTxt.textContent = distanciaAleatoria;
    precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    resultBox.style.display = 'block';
    
    // Hacer scroll suave hacia el resultado
    resultBox.scrollIntoView({ behavior: 'smooth' });
  });
}
