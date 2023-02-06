import json

q = []
id_count = 0

def lambda_handler(event, context):
    global q, id_count
    body = event['body'] # this is a request from the website
    body = json.loads(body)
    client = body["clientID"]
    if body["action"] == "register":
        id_count += 1
        client = id_count
        q.append(client)
        access_permission = q.index(client)+1
    if body["action"] == "remove":
        q.remove(client)
        access_permission = 0
    if body["action"] == "status_check":
        try:
            access_permission = q.index(client)+1
        except:
            access_permission = 0
        
    return {
        'statusCode': 200,
        "headers": {
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods':'POST, OPTIONS'
        },
        'body': json.dumps({"access_permission": access_permission, "clientID": client})
    }