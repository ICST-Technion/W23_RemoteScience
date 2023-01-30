import json
import boto3
import logging
 
logger = logging.getLogger()
logger.setLevel(logging.INFO)
 
client = boto3.client('iot-data')
 
def lambda_handler(event, context):
    
    # print(json.dumps(event))
    print("Thing Name: " + json.dumps(event['queryStringParameters']['thingname']))
    
    logger.info("Attempting to fetch Shadow State")
    
    THINGNAME=event['queryStringParameters']['thingname']
    if (THINGNAME == ""):
        print("No Thing Name found. Setting Thing Name = RemoteSciencePi")
        THINGNAME="RemoteSciencePi"
    
    try:
        response = client.get_thing_shadow(thingName=THINGNAME)
        logger.info("Shadow State Received")
        res = response['payload'].read()
        res_json = json.loads(res)
        print("recieved results from shadow: " + json.dumps(res_json))
        
        # read from PI to website
        result = res_json['state']['reported']
        # get experiment results.
        logger.info("Received From IoT: " + json.dumps(result))
        
        logger.info("\nChanging for website\n")
     
        # translate to readable JSON and send to website
        value = result['result'] #TODO: replace with our experiment results
        if (value is not None):
            result['result'] = value
        
        logger.info("Sending to Website: " + json.dumps(result) + "\n")
        
        return {
            'statusCode': 200,
            "headers": {
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods':'GET,OPTIONS'
            },
            'body': json.dumps(result)
        }
    except:
        result = {"result": "Device Shadow State Error"}
        return {
            'statusCode': 200,
            "headers": {
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods':'GET,OPTIONS'
            },
            'body': json.dumps(result)
        }