  btnCalcular.addEventListener('click', async () => {
    const inputOrigen = document.getElementById('origenInput');
    const inputDestino = document.getElementById('destinoInput');
    const inputValorConsig = document.getElementById('valorConsignacionInput');
    
    const origenVal = normalizarTexto(inputOrigen.value);
    const destinoVal = normalizarTexto(inputDestino.value);
    const montoConsignar = inputValorConsig ? parseFloat(inputValorConsig.value) || 0 : 0;

    let distanciaKm = 3.0;
    let coordsOrigen = null;
    let coordsDestino = null;
    let destinoEncontrado = false;

    const textoBusquedaDestino = servicioSeleccionado === 'consignacion' ? origenVal : destinoVal;

    // 1. BUSCAR ORIGEN ESTRICTAMENTE EN EL DICCIONARIO
    for (let zona in directorioTulua) {
      const zonaNorm = normalizarTexto(zona);
      // Coincidencia exacta o si contiene el texto ingresado
      if (origenVal === zonaNorm || zonaNorm.includes(origenVal)) {
        coordsOrigen = directorioTulua[zona];
        break;
      }
    }

    if (!coordsOrigen) {
      alert(`⚠️ El origen "${inputOrigen.value}" no es un barrio o corregimiento válido de Tuluá.`);
      return;
    }

    // 2. SI ES INTERMUNICIPAL, BUSCAR EN DESTINOS REGIONALES
    if (servicioSeleccionado === 'intermunicipal') {
      for (let key in destinosRegionales) {
        const keyNorm = normalizarTexto(key);
        if (textoBusquedaDestino === keyNorm || keyNorm.includes(textoBusquedaDestino)) {
          distanciaKm = destinosRegionales[key].km;
          coordsDestino = destinosRegionales[key].coords;
          destinoEncontrado = true;
          break;
        }
      }
      if (!destinoEncontrado) {
        alert(`⚠️ El municipio de destino no está en la lista regional permitida.`);
        return;
      }
    } else {
      // 3. SI ES URBANO, BUSCAR DESTINO ESTRICTAMENTE EN EL DICCIONARIO
      if (servicioSeleccionado !== 'consignacion') {
        for (let zona in directorioTulua) {
          const zonaNorm = normalizarTexto(zona);
          if (textoBusquedaDestino === zonaNorm || zonaNorm.includes(textoBusquedaDestino)) {
            coordsDestino = directorioTulua[zona];
            destinoEncontrado = true;
            break;
          }
        }

        if (!destinoEncontrado) {
          alert(`⚠️ El destino "${inputDestino.value}" no corresponde a ningún barrio o corregimiento registrado.`);
          return;
        }
      } else {
        // Para consignación el destino es el mismo origen (punto de recogida)
        coordsDestino = coordsOrigen;
        destinoEncontrado = true;
      }
    }

    // Limpiar capa de ruta anterior
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Petición OSRM para trazar ruta real entre esos dos puntos exactos
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

    // Reinicio seguro
    inputOrigen.value = '';
    inputDestino.value = '';
    if (inputValorConsig) inputValorConsig.value = '';
  });
        
