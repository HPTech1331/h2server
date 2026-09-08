# Complete HTTP data links (dummy examples)

## Live site (custom domain)

Simple message:
https://h2server.online/ingest.html?data=hello-from-device

Temperature + humidity:
https://h2server.online/ingest.html?temp=24.5&hum=60&device=ESP32

JSON payload:
https://h2server.online/ingest.html?json={"temp":24.5,"hum":60,"device":"ESP32"}

Sensor reading:
https://h2server.online/ingest.html?data=sensor=MQ2&value=412&unit=ppm

## Local preview (npm start → port 3000)

Simple message:
http://localhost:3000/ingest.html?data=hello-from-device

Temperature + humidity:
http://localhost:3000/ingest.html?temp=24.5&hum=60&device=ESP32

JSON payload:
http://localhost:3000/ingest.html?json={"temp":24.5,"hum":60,"device":"ESP32"}

## After you hit a link

1. Login: index.html (user H2@123 / pass h2tech@123)
2. Open main.html — the data appears under **HTTP data**
