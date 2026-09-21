const websocket = new WebSocket('wss://echo-ws-service.herokuapp.com');

const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const locationButton = document.querySelector('#location-button');
const statusText = document.querySelector('#status');
const messages = document.querySelector('#messages');

const locationMessages = new Set();

websocket.addEventListener('open', function () {
    statusText.textContent = 'Соединение установлено';
    sendButton.disabled = false;
    locationButton.disabled = false;
});

websocket.addEventListener('message', function (event) {
    if (locationMessages.has(event.data)) {
        locationMessages.delete(event.data);
        return;
    }

    addMessage(event.data, 'message-server');
});

websocket.addEventListener('close', function () {
    statusText.textContent = 'Соединение закрыто';
    sendButton.disabled = true;
    locationButton.disabled = true;
});

websocket.addEventListener('error', function () {
    statusText.textContent = 'Ошибка подключения к серверу';
});

function addMessage(text, className, linkText = '') {
    const message = document.createElement('div');
    message.classList.add('message', className);

    if (linkText !== '') {
        const link = document.createElement('a');
        link.href = text;
        link.textContent = linkText;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        message.appendChild(link);
    } else {
        message.textContent = text;
    }

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();

    if (text === '' || websocket.readyState !== WebSocket.OPEN) {
        return;
    }

    websocket.send(text);
    addMessage(text, 'message-user');
    messageInput.value = '';
    messageInput.focus();
}

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

locationButton.addEventListener('click', function () {
    if (!navigator.geolocation) {
        statusText.textContent = 'Браузер не поддерживает геолокацию';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const mapLink = 'https://www.openstreetmap.org/#map=18/'
                + latitude + '/' + longitude;

            locationMessages.add(mapLink);
            websocket.send(mapLink);
            addMessage(mapLink, 'message-user', 'Моя геолокация');
        },
        function () {
            statusText.textContent = 'Не удалось получить геолокацию';
        }
    );
});
