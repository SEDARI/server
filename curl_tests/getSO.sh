# TOKEN="zQCydgyCVXhl8ox57uQc47uac6e7Zu9D3YjML2VFo5QFckT4XnV3KFNY3JVEiJ2h"
# ID="43548148-247c-4729-b449-077ba0ef0c40"

curl -v -X GET -H "Content-type: application/json" -H "Authorization: bearer $TOKEN" http://localhost:3002/serios/$ID
