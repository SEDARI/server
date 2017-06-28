TOKEN="izXGiQa8TG3dPiRrTGWMlmhGwzo3cvGZpFV7VjI2nq0zkXR48O4xogJpncRRQFhY"
ID="5d6ee1ad-9312-4e94-b82a-285ffb255bd8"

curl -v -X GET -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" http://localhost:3002/serios/api/version
curl -v -X GET -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" http://localhost:3002/serios/$ID
