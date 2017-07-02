# TOKEN="a9nKZ7NVrk2lGHMqMUhlAI0Erv6drWhz3uWPoK9G1vgNm6A4A3H3I8NHVz0NfGPP"
# ID="43548148-247c-4729-b449-077ba0ef0c40"

curl -v -X GET -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" http://localhost:3002/serios/$ID/streams/temperature/lastUpdate
