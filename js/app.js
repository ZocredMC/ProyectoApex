// ==========================================
// INTERACTIVIDAD Y APLICACIÓN (app.js)
// ==========================================

const serviceCards = document.querySelectorAll('.service-card');
let servicioSeleccionado = 'comida';

serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    serviceCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    
    servicioSeleccionado = card.getAttribute('data-service');
    actualizarCamposSegunServicio(servicioSeleccionado);
    
    if (typeof ajustarZoomMapa === 'function') {
      ajustarZoomMapa(servicioSeleccionado);
    }
  });
});

function actualizarCamposSegunServicio(servicio) {
  const lblOrigen = document.getElementById('lblOrigen');
  const lblDestino = document.getElementById('lblDestino');
  const grupoDestinoContainer = document.getElementById('grupoDestinoContainer');
  const extrasContainer = document.getElementById('extrasServicioContainer');
  
  if (!extrasContainer || !grupoDestinoContainer) return;

  extrasContainer.innerHTML = '';
  extrasContainer.style.display = 'none';
  grupoDestinoContainer.style.display = 'block';

  if (servicio === 'consignacion') {
    grupoDestinoContainer.style.display = 'none'; 
    lblOrigen.textContent = "📍 Barrio o Corregimiento de Recogida en Tuluá:";
    extrasContainer.style.display = 'block';
    extrasContainer.innerHTML = `
      <div class="input-group" style="margin-bottom: 0;">
        <label>💵 Cantidad a Consignar:</label>
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
    lblDestino.textContent = "🏁 Destino (Municipio regional):";
  } else {
    lblOrigen.textContent = "📍 Barrio o Corregimiento de Recogida:";
    lblDestino.textContent = "🏁 Barrio o Corregimiento de Entrega:";
  }
}

// ==========================================
// CONTROL DE MODALES
// ==========================================
const btnHacerPedido = document.getElementById('btnHacerPedido');
const modalPedido = document.getElementById('modalPedido');

if (btnHacerPedido && modalPedido) {
  btnHacerPedido.addEventListener('click', () => {
    modalPedido.style.display = 'flex';
  });
}

window.cerrarModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
};

window.abrirAuthModal = function(tipo) {
  alert(`Abriendo modal de ${tipo === 'login' ? 'Inicio de Sesión' : 'Registro'}`);
};

// ==========================================
// CÁLCULO DE TARIFA
// ==========================================
const btnCalcular = document.getElementById('btnCalcular');
const resultBox = document.getElementById('resultBox');
const distanciaTxt = document.getElementById('distanciaTxt');
const precioTxt = document.getElementById('precioTxt');

if (btnCalcular) {
  btnCalcular.addEventListener('click', async () => {
    const inputOrigen = document.getElementById('origenInput');
    const inputDestino = document.getElementById('destinoInput');
    const inputValorConsig = document.getElementById('valorConsignacionInput');
    
    const origenTexto = inputOrigen ? inputOrigen.value.trim() : '';
    const destinoTexto = inputDestino ? inputDestino.value.trim() : '';
    const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;

    let distanciaKm = 3.0;

    try {
      // Llamada al módulo externo de mapas
      distanciaKm = await calcularRutaYMapa(origenTexto, destinoTexto, servicioSeleccionado);
    } catch (error) {
      alert(`⚠️ ${error.message}`);
      return;
    }

    // Cálculo matemático de la tarifa
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

    if (distanciaTxt) distanciaTxt.textContent = distanciaKm > 0 ? distanciaKm.toFixed(1) : "Local";
    if (precioTxt) precioTxt.textContent = precioCalculado.toLocaleString('es-CO');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
