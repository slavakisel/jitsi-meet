import {
	getDialInNumbers,
    getDialInConferenceID
} from './functions';

export function loadDialIn(state, onSuccess, onError) {
	const { dialInConfCodeUrl, dialInNumbersUrl, hosts } = state['features/base/config'];
    const { room } = state['features/base/conference'];

	const mucURL = hosts && hosts.muc;

    if (!dialInConfCodeUrl || !dialInNumbersUrl || !mucURL) {
        // URLs for fetching dial in numbers not defined
        return;
    }

    Promise.all([
        getDialInNumbers(dialInNumbersUrl),
        getDialInConferenceID(dialInConfCodeUrl, room, mucURL)
    ]).then(([ dialInNumbers, { conference, id, message } ]) => {
        if (!conference || !id) {
            return Promise.reject(message);
        }

        onSuccess(dialInNumbers, conference, id, message);
    })
    .catch(error => {
    	onError(error);
    });
}