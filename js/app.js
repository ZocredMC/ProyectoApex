// ==========================================
// CÁLCULO DE RUTA Y TARIFA (CON VALIDACIÓN DE BARRIOS)
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
    
    const origenTexto = inputOrigen.value.trim();
    const destinoTexto = inputDestino.value.trim();
    const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;

    let distanciaKm = 3.0;
    let coordsOrigen = [...TULUA_COORDS];
    let coordsDestino = [4.09, -76.21];
    let destinoEncontrado = false;

    const textoVerificacionDestino = servicioSeleccionado === 'consignacion' ? origenTexto : destinoTexto;

    // 1. Validar y corregir Origen contra el Diccionario de Tuluá
    let origenValido = false;
    const origenNorm = normalizarTexto(origenTexto);
    for (let zona in directorioTulua) {
      const zonaNorm = normalizarTexto(zona);
      if (origenNorm === zonaNorm || zonaNorm.includes(origenNorm)) {
        coordsOrigen = directorioTulua[zona];
        origenValido = true;
        break;
      }
    }

    if (!origenValido && origenTexto !== "") {
      alert(`⚠️ El barrio o corregimiento de origen ("${origenTexto}") no está registrado en Tuluá.`);
      return;
    }

    // 2. Validar Destino según el servicio
    if (servicioSeleccionado === 'intermunicipal') {
      const destinoNorm = normalizarTexto(textoVerificacionDestino);
      for (let key in destinosRegionales) {
        const keyNorm = normalizarTexto(key);
        if (destinoNorm === keyNorm || keyNorm.includes(destinoNorm)) {
          distanciaKm = destinosRegionales[key].km;
          coordsDestino = destinosRegionales[key].coords;
          destinoEncontrado = true;
          break;
        }
      }
      if (!destinoEncontrado) {
        alert(`⚠️ El municipio de destino no está en la cobertura regional permitida.`);
        return;
      }
    } else if (servicioSeleccionado === 'consignacion') {
      coordsDestino = coordsOrigen;
      destinoEncontrado = true;
    } else {
      let destinoValido = false;
      const destinoNorm = normalizarTexto(textoVerificacionDestino);
      for (let zona in directorioTulua) {
        const zonaNorm = normalizarTexto(zona);
        if (destinoNorm === zonaNorm || zonaNorm.includes(destinoNorm)) {
          coordsDestino = directorioTulua[zona];
          destinoValido = true;
          destinoEncontrado = true;
          break;
        }
      }

      if (!destinoValido && destinoTexto !== "") {
        alert(`⚠️ El barrio o corregimiento de destino ("${destinoTexto}") no está registrado en Tuluá.`);
        return;
      }
    }

    // Limpiar capa de ruta anterior en el mapa
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Petición OSRM estándar con las coordenadas validadas
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

    // Limpieza de campos al terminar
    inputOrigen.value = '';
    inputDestino.value = '';
    if (inputValorConsig) inputValorConsig.value = '';
  });
}
