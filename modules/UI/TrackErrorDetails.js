// @flow

import { JitsiTrackErrors } from '../../react/features/base/lib-jitsi-meet';
import type { JitsiTrackError } from '../../react/features/base/lib-jitsi-meet';

const JITSI_TRACK_ERROR_TO_MESSAGE_KEY_MAP = {
    microphone: {
        [JitsiTrackErrors.GENERAL]: 'dialog.micUnknownError',
        [JitsiTrackErrors.PERMISSION_DENIED]: 'dialog.micPermissionDeniedError',
        [JitsiTrackErrors.NOT_FOUND]: 'dialog.micNotFoundError',
        [JitsiTrackErrors.CONSTRAINT_FAILED]: 'dialog.micConstraintFailedError',
        [JitsiTrackErrors.NO_DATA_FROM_SOURCE]: 'dialog.micNotSendingData'
    },
    camera: {
        [JitsiTrackErrors.UNSUPPORTED_RESOLUTION]: 'dialog.cameraUnsupportedResolutionError',
        [JitsiTrackErrors.GENERAL]: 'dialog.cameraUnknownError',
        [JitsiTrackErrors.PERMISSION_DENIED]: 'dialog.cameraPermissionDeniedError',
        [JitsiTrackErrors.NOT_FOUND]: 'dialog.cameraNotFoundError',
        [JitsiTrackErrors.CONSTRAINT_FAILED]: 'dialog.cameraConstraintFailedError',
        [JitsiTrackErrors.NO_DATA_FROM_SOURCE]: 'dialog.cameraNotSendingData'
    }
};

type ErrorDetails = {
  errorMsg: string,
  additionalErrorMsg: string | null,
  title: string
}

/**
 * Returns error details for the passed mic error.
 *
 * @param {JitsiTrackError} micError - An error object related to using or
 * acquiring a video stream.
 * @returns {ErrorDetails}
 * @returns {void}
 */
export const micError = (error: JitsiTrackError): ErrorDetails | void => {
    if (!error) {
        return;
    }

    const { message, name } = error;

    const micJitsiTrackErrorMsg = JITSI_TRACK_ERROR_TO_MESSAGE_KEY_MAP.microphone[name];

    const errorMsg = micJitsiTrackErrorMsg
        || JITSI_TRACK_ERROR_TO_MESSAGE_KEY_MAP.microphone[JitsiTrackErrors.GENERAL];

    const additionalErrorMsg = micJitsiTrackErrorMsg ? null : message;

    const title = name === JitsiTrackErrors.PERMISSION_DENIED
        ? 'deviceError.microphonePermission' : 'deviceError.microphoneError';

    return {
        errorMsg,
        additionalErrorMsg,
        title
    };
};

export const cameraError = (error: JitsiTrackError): ErrorDetails | void => {
    if (!error) {
        return;
    }

    const { message, name } = error;

    const cameraJitsiTrackErrorMsg = JITSI_TRACK_ERROR_TO_MESSAGE_KEY_MAP.camera[name];

    const errorMsg = cameraJitsiTrackErrorMsg
        || JITSI_TRACK_ERROR_TO_MESSAGE_KEY_MAP.camera[JitsiTrackErrors.GENERAL];

    const additionalErrorMsg = cameraJitsiTrackErrorMsg ? null : message;

    const title = name === JitsiTrackErrors.PERMISSION_DENIED
        ? 'deviceError.cameraPermission' : 'deviceError.cameraError';

    return {
        errorMsg,
        additionalErrorMsg,
        title
    };
};

const TrackErrorDetails = {
    micError,
    cameraError
};

export default TrackErrorDetails;
