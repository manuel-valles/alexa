const Alexa = require('ask-sdk');

const flashcardsDictionary = [
  {
    question: 'How do you find the length of a string?',
    rubyAnswer: 'length',
    pythonAnswer: 'len',
    javascriptAnswer: 'length'
  },
  {
    question: 'How do you print to the console or terminal?',
    rubyAnswer: 'puts',
    pythonAnswer: 'print',
    javascriptAnswer:'console.log'
  },
  {
    question:'Are the boolean terms true and false capitalized or lowercase?',
    rubyAnswer: 'lowercase',
    pythonAnswer: 'capitalized',
    javascriptAnswer: 'lowercase'
  }];

const DECK_LENGTH = flashcardsDictionary.length;

const AskQuestion = (currentFlashcardIndex, currentLanguage) => {
  if (currentFlashcardIndex >= flashcardsDictionary.length) {
    return 'No questions remaining';
  } else {
    var currentQuestion = flashcardsDictionary[currentFlashcardIndex].question;
    return 'Here is the question: In ' + currentLanguage + ', ' + currentQuestion;
  }
};

const clearInfoCurrentFlashcard = (attributes, currentLanguage) => {
  attributes.flashcards.languages[currentLanguage].numberCorrect = 0;
  attributes.flashcards.languages[currentLanguage].currentFlashcardIndex = 0;
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {

      const attributesManager = handlerInput.attributesManager;
      const responseBuilder = handlerInput.responseBuilder;
      const attributes = await attributesManager.getPersistentAttributes() || {};
      let speechText = 'Welcome to Flashcards. In this session, do you want to test your knowledge in Ruby, Python, or Javascript?';
      let repromptText = 'Which language would you like to practice?';

      if (Object.keys(attributes).length !== 0) {
        let currentLanguage = attributes.flashcards.currentLanguage;
        let numberCorrect = attributes.flashcards.languages[currentLanguage].numberCorrect; 
        let currentFlashcardIndex = attributes.flashcards.languages[currentLanguage].currentFlashcardIndex;
        const commonSpeechText = `If you want to keep practicing ${currentLanguage}, please say Practice ${currentLanguage}. Otherwise, Which language would you like to practice?`;
        if (currentFlashcardIndex === 3){
          speechText = `Welcome back to Flashcards. You finished the questions of ${currentLanguage} last time with ${numberCorrect} correct answers. ${commonSpeechText}`;
          clearInfoCurrentFlashcard(attributes, currentLanguage); 
        } else {
          speechText = `Welcome back to Flashcards. You are currently working on ${currentLanguage}. You're on question ${currentFlashcardIndex} and have answered ${numberCorrect} correctly. 
          ${commonSpeechText}`; 
        }
        repromptText = `${AskQuestion(currentFlashcardIndex, currentLanguage)}`;
      }
      attributesManager.setPersistentAttributes(attributes);
      await attributesManager.savePersistentAttributes();

        return responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .getResponse();
    }
};

const SetMyLanguageIntentHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest' && request.intent.name === 'SetMyLanguageIntent';
    },
    async handle(handlerInput) {
      let currentLanguage = handlerInput.requestEnvelope.request.intent.slots.languages.value;
      const attributesManager = handlerInput.attributesManager;
      const responseBuilder = handlerInput.responseBuilder;
      const attributes = await attributesManager.getPersistentAttributes() || {};
        
      if(currentLanguage.toLowerCase() ===  'javascript') {
          currentLanguage = 'javascript';
      }
      attributes.flashcards.currentLanguage = currentLanguage;
      const currentFlashcardIndex = attributes.flashcards.languages[currentLanguage].currentFlashcardIndex; 

      if (Object.keys(attributes).length === 0) {
        attributes.flashcards = {
          'currentLanguage': '',
          'languages': {
            'ruby': {
              'numberCorrect': 0,
              'currentFlashcardIndex': 0
            },
            'python': {
              'numberCorrect': 0,
              'currentFlashcardIndex': 0
            },
            'javascript': {
              'numberCorrect': 0,
              'currentFlashcardIndex': 0
            }
          }
        };
      } else if (currentFlashcardIndex === 3){
        clearInfoCurrentFlashcard(attributes, currentLanguage); 
      }
      
      const speechText = `Okay, I will ask you some questions about ${currentLanguage}. ${AskQuestion(currentFlashcardIndex, currentLanguage)}`;
      const speechReprompt = `${AskQuestion(currentFlashcardIndex, currentLanguage)}`;
      
      attributesManager.setPersistentAttributes(attributes);
      await attributesManager.savePersistentAttributes();
        
        return responseBuilder
            .speak(speechText)
            .reprompt(speechReprompt)
            .getResponse();
    }
};

const AnswerIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'AnswerIntent';
  },
  async handle(handlerInput) {
      const userAnswer = handlerInput.requestEnvelope.request.intent.slots.answer.value.toLowerCase();
      const attributesManager = handlerInput.attributesManager;
      const responseBuilder = handlerInput.responseBuilder;
      const attributes = await attributesManager.getPersistentAttributes() || {};
      let currentLanguage = attributes.flashcards.currentLanguage;
      let languageAnswer = `${currentLanguage}Answer`;
      let currentFlashcardIndex = attributes.flashcards.languages[currentLanguage].currentFlashcardIndex;
      let correctAnswer = flashcardsDictionary[currentFlashcardIndex][languageAnswer];
      attributes.flashcards.languages[currentLanguage].currentFlashcardIndex++;
      currentFlashcardIndex++;
      let speechText = '';
      let numberCorrect = attributes.flashcards.languages[currentLanguage].numberCorrect;
      
      if (userAnswer === correctAnswer){
        attributes.flashcards.languages[currentLanguage].numberCorrect++;
        numberCorrect++;
        speechText = `Nice job! The correct answer is ${correctAnswer}. You have gotten ${numberCorrect} out of ${DECK_LENGTH} ${currentLanguage} questions correct. ${AskQuestion(currentFlashcardIndex, currentLanguage)}`;
      } else {  
        speechText = `Sorry, The correct answer is ${correctAnswer}. You have gotten ${numberCorrect} out of ${DECK_LENGTH} ${currentLanguage} questions correct. ${AskQuestion(currentFlashcardIndex, currentLanguage)}`;
      }
      
      attributesManager.setPersistentAttributes(attributes);
      await attributesManager.savePersistentAttributes();
      const speechReprompt = `${AskQuestion(currentFlashcardIndex, currentLanguage)}`;

      return responseBuilder
          .speak(speechText)
          .reprompt(speechReprompt)
          .getResponse();
  }
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SetMyLanguageIntentHandler,
    AnswerIntentHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('alexa-persistence')
  .withAutoCreateTable(true)
  .lambda();
