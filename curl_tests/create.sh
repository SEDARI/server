TOKEN="1VcjVvUXPGCesX4Iu3nKy0gD4mw2XOcbUUJ8FkPQNHdoREINRcZM7OLMvKWa4zZK"

curl -X POST -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" -d '{ "name": "testSO", "description": "Description for testSO1", "streams": { "temperature": { "channels": { "temp1": { "type": "number", "unit": "Celsius" } } } } }' http://localhost:3002/serios/
