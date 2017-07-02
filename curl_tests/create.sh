# TOKEN="IhE7qCiunGNo8NCDZ1Klo2RVeLYyujZhIihKVXwJVj3Unhn6C7HmsZ5wMr1svcWE"

curl -X POST -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" -d '{ "name": "testSO", "description": "Description for testSO1", "streams": { "temperature": { "channels": { "temp1": { "type": "number", "unit": "Celsius" }, "temp2": { "type": "number", "unit": "Celsius" } } } } }' http://localhost:3002/serios/
