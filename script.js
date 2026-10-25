// URL de tu API en la nube (Render)
const API_URL = "https://iot-api-proyecto.onrender.com";

// ESTADO GLOBAL DEL FRONTEND
let currentMode = 'auto'; // 'auto' o 'manual'

// 1. CAMBIAR MODO DE OPERACIÓN (AUTOMÁTICO / MANUAL)
function setMode(mode) {
    currentMode = mode;

    const btnAuto = document.getElementById('btnModeAuto');
    const btnManual = document.getElementById('btnModeManual');
    const manualBadge = document.getElementById('manualBadge');

    const manualButtons = [
        document.getElementById('btnLeft'),
        document.getElementById('btnRight'),
        document.getElementById('btnStop')
    ];

    if (mode === 'auto') {
        // Estilos visuales para Modo Automático
        btnAuto.className = "cute-button font-fredoka px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-pastel-pink text-white shadow";
        btnManual.className = "cute-button font-fredoka px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 text-gray-500 hover:text-gray-700";
        
        // Bloquear botones manuales
        manualButtons.forEach(btn => btn.disabled = true);
        manualBadge.innerText = "Bloqueado";
        manualBadge.className = "bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full font-bold uppercase border";
    } else {
        // Estilos visuales para Modo Manual
        btnManual.className = "cute-button font-fredoka px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-pastel-pink text-white shadow";
        btnAuto.className = "cute-button font-fredoka px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 text-gray-500 hover:text-gray-700";

        // Habilitar botones manuales
        manualButtons.forEach(btn => btn.disabled = false);
        manualBadge.innerText = "Activo";
        manualBadge.className = "bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-300";
    }

    // CORREGIDO: Usando la variable API_URL
    fetch(`${API_URL}/modo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: mode })
    })
    .then(res => res.json())
    .then(data => console.log('Modo actualizado en API:', data))
    .catch(err => console.error('Error al cambiar modo:', err));
}

// 2. ENVIAR COMANDOS MANUALES AL MOTOR
function sendMotorCommand(action) {
    if (currentMode !== 'manual') return; // Si no está en manual, no hace nada

    // CORREGIDO: Usando la variable API_URL
    fetch(`${API_URL}/motor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando: action })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Comando enviado con éxito:', data);
        updateMotorUI(action);
    })
    .catch(err => console.error('Error al enviar comando al motor:', err));
}

// Actualizar texto visual del estado del motor en la página
function updateMotorUI(state) {
    const motorText = document.getElementById('motorStateText');

    if (state === 'derecha') {
        motorText.innerHTML = `<i class="fa-solid fa-rotate-right text-emerald-500 animate-spin"></i> Girando a la Derecha`;
    } else if (state === 'izquierda') {
        motorText.innerHTML = `<i class="fa-solid fa-rotate-left text-indigo-500 animate-spin"></i> Girando a la Izquierda`;
    } else {
        motorText.innerHTML = `<i class="fa-solid fa-circle-stop text-rose-500"></i> Motor Detenido`;
    }
}

// 3. CONSULTAR LA DISTANCIA DEL SENSOR DESDE LA API CADA 2 SEGUNDOS
function fetchSensorDistance() {
    // CORREGIDO: Usando la variable API_URL
    fetch(`${API_URL}/sensor`)
    .then(res => res.json())
    .then(data => {
        updateDistanceDisplay(data.distancia);
    })
    .catch(err => {
        console.warn('Esperando conexión con la API en la nube...');
    });
}

// Actualizar los componentes visuales de la distancia en la interfaz
function updateDistanceDisplay(dist) {
    document.getElementById('distanceDisplay').innerText = dist;

    const now = new Date();
    document.getElementById('lastUpdated').innerText = `Actualizado ${now.toLocaleTimeString()}`;

    // Barra de progreso dinámica (asumiendo un rango máximo de 60 cm)
    const maxRange = 60;
    const percentage = Math.min(100, Math.max(0, (dist / maxRange) * 100));
    document.getElementById('distanceBar').style.width = `${percentage}%`;

    // Mensaje de feedback según las reglas de distancia
    const feedback = document.getElementById('distanceFeedback');
    if (dist >= 10 && dist <= 25) {
        feedback.innerHTML = `✨ Rango Derecha Activo (${dist} cm)`;
    } else if (dist >= 26 && dist <= 40) {
        feedback.innerHTML = `🌸 Rango Izquierda Activo (${dist} cm)`;
    } else {
        feedback.innerHTML = `🛑 Fuera de rango / Detenido (${dist} cm)`;
    }
}

// Iniciar las consultas periódicas al servidor de la API cada 2 segundos
setInterval(fetchSensorDistance, 2000);
fetchSensorDistance();
