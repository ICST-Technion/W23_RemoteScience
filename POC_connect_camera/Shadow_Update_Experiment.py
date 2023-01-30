import json
import boto3
import logging
 
logger = logging.getLogger()
logger.setLevel(logging.INFO)
 
client = boto3.client('iot-data')
 
def lambda_handler(event, context):
    print(json.dumps(event['body']))
    
    body = event['body'] # this is a request from the website, we update ths shadow accordingly
    body = json.loads(body)
    
    THINGNAME=body['thingname']
    if (THINGNAME == ""):
        print("No Thing Name found. Setting Thing Name = RemoteSciencePi")
        THINGNAME="RemoteSciencePi"
    
    if body['action'] == "start": # start experiment + parameters
        # requested experiment params
        length = body['length']
        angle = body['angle']
        payload = json.dumps({'state': { 'desired': { 'action': 'start', 'length': length, 'angle': angle, 'result': '-' } }})
        
        logger.info("Attempting to Update Shadow State to START EXPERIMENT")
        response = client.update_thing_shadow(
            thingName=THINGNAME,
            payload=payload
        )
        logger.info("IOT Shadow Updated")
    else: # stop experiment
        payload = json.dumps({'state': { 'desired': { 'action': 'stop', 'length': '-', 'angle': '-', 'result': '-' } }})
        
        logger.info("Attempting to Update Shadow State to STOP EXPERIMENT")
        response = client.update_thing_shadow(
            thingName=THINGNAME,
            payload=payload
        )
        logger.info("IOT Shadow Updated")
        
    
    return {
        'statusCode': 200,
        "headers": {
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods':'GET,OPTIONS'
        },
        'body': json.dumps('Shadow Updated!')
    }