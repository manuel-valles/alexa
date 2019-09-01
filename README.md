# Alexa
ASK (Alexa Software Development Kit) for Node.js

_Version 2_


Main links:
- Create Alexa Skills on the developer console: https://developer.amazon.com/alexa/console/ask
- Create a Lambda function on the AWS: https://eu-west-1.console.aws.amazon.com/lambda/home
- Add a Role for the DynamoDB on the AWS (IAM): https://console.aws.amazon.com/iam/home#/roles
- Check the created tables in the DynamoDB: https://eu-west-1.console.aws.amazon.com/dynamodb/home?region=eu-west-1#tables:

### ASK CLI:
- First time:
  - Install the package:
     - $ npm install -g ask-cli
  - Initialize the tool with your Amazon developer account:
    - $ ask init
    
- Create new skill:
  - $ ask new --skill-name 'my-skill'
- Deploy it: 
  - $ cd my-skill
  - $ ask deploy
