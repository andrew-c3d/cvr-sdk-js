class Network {
	constructor(core) {
		this.core = core;
	}

	networkCall(suburl, content) {

		return new Promise((resolve, reject) => {
			if (!this.core.sceneData.sceneId || !this.core.sceneData.versionNumber){
				reject('no scene selected');
				return 'no scene selected';
			}
			let path = "https://" + this.core.config.networkHost + "/v" + this.core.config.networkVersion + "/" + suburl + "/" + this.core.sceneData.sceneId + "?version=" + this.core.sceneData.versionNumber;
			let options = {
				method: 'post',
				headers: new Headers({
					'Authorization': "APIKEY:DATA " + this.core.config.APIKey,
					'Content-Type': 'application/json'
				}),
				body: JSON.stringify(content)
			}
			if (window && window.navigator && window.navigator.onLine) {
				fetch(path, options)
					.then(res => resolve(res.status));
			} else {
				resolve('Network.networkCall failed: please check internet connection.');
				console.log('Network.networkCall failed: please check internet connection.');
			}
		});
	};
	networkExitpollGet(hook) {
		return new Promise((resolve, reject) => {
			let path = "https://" + this.core.config.networkHost + "/v" + this.core.config.networkVersion + "/questionSetHooks/" + hook + "/questionSet";
			console.log("Network.networkExitpollGet: " + path);
			let options = {
				method: 'get',
				headers: new Headers({
					'Authorization': "APIKEY:DATA " + this.core.config.APIKey,
					'Content-Type': 'application/json'
				})
			};
			fetch(path, options)
				.then(response => response.json())
				.then(payload => resolve(payload))
				.then(payload => resolve(payload))
				.catch(err =>reject(err));
		});
	};
	networkExitpollPost(questionsetname, questionsetversion, content) {
		return new Promise((resolve, reject) => {
			let options = {
				method: 'post',
				headers: new Headers({
					'Authorization': "APIKEY:DATA " + this.core.config.APIKey,
					'Content-Type': 'application/json'
				}),
				body: JSON.stringify(content)
			};
			let path = "https://" + this.core.config.networkHost + "/v" + this.core.config.networkVersion + "/questionSets/" + questionsetname + "/" + questionsetversion + "/responses";
			fetch(path, options)
				.then(res => res.status)
				.then(res => resolve(res))
				.catch(err => console.error(err));
		});
	}

}

export default Network;