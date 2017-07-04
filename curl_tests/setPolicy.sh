curl -v -X PUT -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" -d '[{"to":true},{"to":false}]' http://localhost:3002/pap/$ID/$PROP
