// @flow

import { getPinnedParticipant } from '../base/participants';

declare var interfaceConfig: Object;

/**
 * Determines whether the remote video thumbnails should be displayed/visible in
 * the filmstrip.
 *
 * @param {Object} state - The full redux state.
 * @returns {boolean} - If remote video thumbnails should be displayed/visible
 * in the filmstrip, then {@code true}; otherwise, {@code false}.
 */
export function shouldRemoteVideosBeVisible(state: Object) {
    const participants = state['features/base/participants'];
    const participantCount = participants.length;
    let pinnedParticipant;

    return Boolean(
        participantCount > 2

            // Always show the filmstrip when there is another participant to
            // show and the filmstrip is hovered, or local video is pinned, or
            // the toolbar is displayed.
            || (participantCount > 1
                && (state['features/filmstrip'].hovered
                    || ((pinnedParticipant = getPinnedParticipant(participants))
                        && pinnedParticipant.local)))

            || (typeof interfaceConfig === 'object'
                && interfaceConfig.filmStripOnly)

            || state['features/base/config'].disable1On1Mode);
}
