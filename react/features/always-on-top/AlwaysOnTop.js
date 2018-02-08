// @flow

import React, { Component } from 'react';

const { api } = window.alwaysOnTop;

/**
 * The type of the React {@code Component} state of {@link FeedbackButton}.
 */
type State = {
    avatarURL: string,
    displayName: string,
    isVideoDisplayed: boolean,
};

/**
 * Represents the always on top page.
 *
 * @class AlwaysOnTop
 * @extends Component
 */
export default class AlwaysOnTop extends Component<*, State> {
    /**
     * Initializes new AlwaysOnTop instance.
     *
     * @param {*} props - The read-only properties with which the new instance
     * is to be initialized.
     */
    constructor(props: *) {
        super(props);

        this.state = {
            displayName: '',
            isVideoDisplayed: true,
            avatarURL: ''
        };

        // Bind event handlers so they are only bound once per instance.
        this._largeVideoChangedListener
            = this._largeVideoChangedListener.bind(this);
    }

    _largeVideoChangedListener: () => void;

    /**
     * Handles large video changed api events.
     *
     * @returns {void}
     */
    _largeVideoChangedListener() {
        const isVideoDisplayed = Boolean(api._getLargeVideo());

        this.setState({
            isVideoDisplayed
        });
    }

    /**
     * Renders display name and avatar for the on stage participant.
     *
     * @returns {ReactElement}
     */
    _renderVideoNotAvailableScreen() {
        const { avatarURL, displayName, isVideoDisplayed } = this.state;

        if (isVideoDisplayed) {
            return null;
        }

        return (
            <div id = 'videoNotAvailableScreen'>
                {
                    avatarURL
                        ? <div id = 'avatarContainer'>
                            <img
                                id = 'avatar'
                                src = { avatarURL } />
                        </div>
                        : null
                }
                <div
                    className = 'displayname'
                    id = 'displayname'>
                    { displayName }
                </div>
            </div>
        );
    }

    /**
     * Sets mouse move listener and initial toolbar timeout.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        this._largeVideoChangedListener();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {

        return (
            <div id = 'alwaysOnTop'>
                {
                    this._renderVideoNotAvailableScreen()
                }
            </div>
        );
    }
}
