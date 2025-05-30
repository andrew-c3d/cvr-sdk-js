import Network from './network';
class ExitPoll {
	constructor(core, customEvent) {
		this.core = core;
		this.network = new Network(core);
		this.customEvent = customEvent;
		this.currentQuestionSetString = '';
		this.fullResponse = {};
		this.currentQuestionSet = {};
		this.answerType = {
			happySad: 'HAPPYSAD',
			boolean: 'BOOLEAN',
			thumbs: 'THUMBS',
			scale: 'SCALE',
			multiple: 'MULTIPLE',
			voice: 'VOICE'
		}
	}

	requestQuestionSet(hook) {
		return new Promise((resolve, reject) => {
			if (!this.core.isSessionActive) {
				reject('ExitPoll.requestQuestionSet failed: no session active');
				console.log('ExitPoll.requestQuestionSet failed: no session active');
				return;
			}
			this.network.networkExitpollGet(hook, this.exitPollCalback)
				.then(questionset => {
					this.receiveQuestionSet(questionset, hook)
					resolve(true);
				})
		});
	};

	receiveQuestionSet(questionset, hook) {
		this.currentQuestionSetString = JSON.stringify(questionset);
		this.fullResponse['hook'] = hook;
		this.fullResponse['userId'] = this.core.userId;
		this.fullResponse['sceneId'] = this.core.sceneData.sceneId;
		this.fullResponse['sessionId'] = this.core.sessionId;
		this.fullResponse['questionSetId'] = questionset.id;
		let splitquestionid = questionset['id'].split(':');
		this.fullResponse['questionSetName'] = splitquestionid[0];
		this.fullResponse['questionSetVersion'] = splitquestionid[1];
		this.currentQuestionSet = questionset;
	};

	getQuestionSetString() {
		if (!this.currentQuestionSetString) {
			console.log('ExitPoll.currentQuestionSetString no active question set. Returning empty json string');
		}
		return this.currentQuestionSetString;
	};

	getQuestionSet() {
		if (!this.currentQuestionSet) {
			console.log('ExitPoll.GetQuestionSet no active question set. Returning empty json');
		}
		return this.currentQuestionSet;
	};

	clearQuestionSet() {
		this.currentQuestionSetString = '';
		this.currentQuestionSet = '';
		this.fullResponse = {};
	};

	addAnswer(type, answer) {
		if (!type || answer === undefined || answer === null) {
			console.error('ExitPoll.addAnswer: cannot add anser, it takes two arguments, type and answer');
			return;
		}
		let anAnswer = {};
		anAnswer['type'] = this.answerType[type] ? this.answerType[type] : 'BOOlEAN';
		anAnswer['value'] = answer;
		if (this.fullResponse['answers'] && Array.isArray(this.fullResponse['answers'])) {
			this.fullResponse.answers.push(anAnswer);
		} else {
			this.fullResponse['answers'] = [anAnswer];
		}
	};

	sendAllAnswers(pos) {
		return new Promise((resolve, reject) => {

			if (!this.core.isSessionActive) {
				reject('ExitPoll.sendAllAnswers failed: no session active')
				console.log('ExitPoll.sendAllAnswers failed: no session active');
				return;
			}
			//companyname1234-productname-test/questionSets/:questionset_name/:version#/responses
			this.network.networkExitpollPost(this.fullResponse.questionSetName, this.fullResponse.questionSetVersion, this.fullResponse)
				.then(res =>(res === 200) ? resolve(200) : reject(res));

			if (!pos) { pos = [0, 0, 0] }
			let properties = {};
			properties['userId'] = this.core.userId;
			properties['questionSetId'] = this.fullResponse.questionSetId;
			properties['hook'] = this.fullResponse.hook;
			for (let i = 0; i < this.fullResponse.answers.length; i++) {
				//strings are only for voice responses. these do not show up in dash
				//else bool(0-1), null(-32768), number(0-10)
				properties[`Answer${i}`] = (typeof this.fullResponse.answers[i].value === 'string') ? 0 :
					this.fullResponse.answers[i].value;
			}
			this.customEvent.send('cvr.exitpoll', pos, properties);
			this.clearQuestionSet();
		});
	};
}
export default ExitPoll;