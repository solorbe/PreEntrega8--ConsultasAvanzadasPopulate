// const socket = io();


// const input = document.getElementById('textoEntrada');
// const log = document.getElementById('log');

// // Emito mensaje al servidor cuando el usuario presiona Enter en el input
// input.addEventListener('keyup', evt => {

//     if (evt.key === "Enter") {
//         console.log(`Enviando mensaje: ${input.value}`);
//         socket.emit('message2', input.value);
//         input.value = ""
//     }
// });



const socket = io();

socket.on('serviceCreated', (service) => {
    console.log('Nuevo servicio recibido:', service);

    const mensaje = document.getElementById('mensaje');

    mensaje.textContent = `¡Se creó un nuevo servicio: ${service.name}!`;
});

// Escucho los logs del servidor y los muestro en el div log
socket.on('log', data => {
    let logs = '';
    data.logs.forEach(log => {
        logs += `${log.socketid} dice: ${log.message}<br/>`
    })
    log.innerHTML = logs;
});
