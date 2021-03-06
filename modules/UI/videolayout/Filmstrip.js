/* global $, APP, interfaceConfig */

import { setFilmstripVisibility } from '../../../react/features/filmstrip';

import UIEvents from '../../../service/UI/UIEvents';
import UIUtil from '../util/UIUtil';

import {
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../react/features/analytics';

const Filmstrip = {
    /**
     *
     * @param eventEmitter the {EventEmitter} through which {Filmstrip} is to
     * emit/fire {UIEvents} (such as {UIEvents.TOGGLED_FILMSTRIP}).
     */
    init(eventEmitter) {
        this.iconMenuDownClassName = 'icon-menu-down';
        this.iconMenuUpClassName = 'icon-menu-up';
        this.filmstripContainerClassName = 'filmstrip';
        this.filmstrip = $('#remoteVideos');
        this.filmstripRemoteVideos = $('#filmstripRemoteVideosContainer');
        this.eventEmitter = eventEmitter;

        // Show the toggle button and add event listeners only when out of
        // filmstrip only mode.
        if (!interfaceConfig.filmStripOnly) {
            this._initFilmstripToolbar();
            this.registerListeners();
        }
    },

    /**
     * Initializes the filmstrip toolbar.
     */
    _initFilmstripToolbar() {
        const toolbarContainerHTML = this._generateToolbarHTML();
        const className = this.filmstripContainerClassName;
        const container = document.querySelector(`.${className}`);

        UIUtil.prependChild(container, toolbarContainerHTML);

        const iconSelector = '#toggleFilmstripButton i';

        this.toggleFilmstripIcon = document.querySelector(iconSelector);
    },

    /**
     * Generates HTML layout for filmstrip toggle button and wrapping container.
     * @returns {HTMLElement}
     * @private
     */
    _generateToolbarHTML() {
        const container = document.createElement('div');
        const isVisible = this.isFilmstripVisible();

        container.className = 'filmstrip__toolbar';
        container.innerHTML = `
            <button id="toggleFilmstripButton">
                <i class="icon-menu-${isVisible ? 'down' : 'up'}">
                </i>
            </button>
        `;

        return container;
    },

    /**
     * Attach 'click' listener to "hide filmstrip" button
     */
    registerListeners() {
        // Important:
        // Firing the event instead of executing toggleFilmstrip method because
        // it's important to hide the filmstrip by UI.toggleFilmstrip in order
        // to correctly resize the video area.
        $('#toggleFilmstripButton').on(
            'click',
            () => {
                // The 'enable' parameter is set to true if the action results
                // in the filmstrip being hidden.
                sendAnalytics(createToolbarEvent(
                    'toggle.filmstrip.button',
                    {
                        enable: this.isFilmstripVisible()
                    }));
                this.eventEmitter.emit(UIEvents.TOGGLE_FILMSTRIP);
            });

        this._registerToggleFilmstripShortcut();
    },

    /**
     * Registering toggle filmstrip shortcut
     * @private
     */
    _registerToggleFilmstripShortcut() {
        const shortcut = 'F';
        const shortcutAttr = 'filmstripPopover';
        const description = 'keyboardShortcuts.toggleFilmstrip';

        // Important:
        // Firing the event instead of executing toggleFilmstrip method because
        // it's important to hide the filmstrip by UI.toggleFilmstrip in order
        // to correctly resize the video area.
        const handler = () => {
            sendAnalytics(createShortcutEvent(
                'toggle.filmstrip',
                {
                    enable: this.isFilmstripVisible()
                }));
            this.eventEmitter.emit(UIEvents.TOGGLE_FILMSTRIP);
        };

        APP.keyboardshortcut.registerShortcut(
            shortcut,
            shortcutAttr,
            handler,
            description
        );
    },

    /**
     * Changes classes of icon for showing down state
     */
    showMenuDownIcon() {
        const icon = this.toggleFilmstripIcon;

        if (icon) {
            icon.classList.add(this.iconMenuDownClassName);
            icon.classList.remove(this.iconMenuUpClassName);
        }
    },

    /**
     * Changes classes of icon for showing up state
     */
    showMenuUpIcon() {
        const icon = this.toggleFilmstripIcon;

        if (icon) {
            icon.classList.add(this.iconMenuUpClassName);
            icon.classList.remove(this.iconMenuDownClassName);
        }
    },

    /**
     * Toggles the visibility of the filmstrip, or sets it to a specific value
     * if the 'visible' parameter is specified.
     *
     * @param visible optional {Boolean} which specifies the desired visibility
     * of the filmstrip. If not specified, the visibility will be flipped
     * (i.e. toggled); otherwise, the visibility will be set to the specified
     * value.
     *
     * Note:
     * This method shouldn't be executed directly to hide the filmstrip.
     * It's important to hide the filmstrip with UI.toggleFilmstrip in order
     * to correctly resize the video area.
     */
    toggleFilmstrip(visible) {
        const wasFilmstripVisible = this.isFilmstripVisible();

        // If 'visible' is defined and matches the current state, we have
        // nothing to do. Otherwise (regardless of whether 'visible' is defined)
        // we need to toggle the state.
        if (visible === wasFilmstripVisible) {
            return;
        }

        this.filmstrip.toggleClass('hidden');

        if (wasFilmstripVisible) {
            this.showMenuUpIcon();
        } else {
            this.showMenuDownIcon();
        }

        if (this.eventEmitter) {
            this.eventEmitter.emit(
                UIEvents.TOGGLED_FILMSTRIP,
                !wasFilmstripVisible);
        }
        APP.store.dispatch(setFilmstripVisibility(!wasFilmstripVisible));
    },

    /**
     * Shows if filmstrip is visible
     * @returns {boolean}
     */
    isFilmstripVisible() {
        return !this.filmstrip.hasClass('hidden');
    },

    /**
     * Adjusts styles for filmstrip-only mode.
     */
    setFilmstripOnly() {
        this.filmstrip.addClass('filmstrip__videos-filmstripOnly');
    },

    /**
     * Returns the height of filmstrip
     * @returns {number} height
     */
    getFilmstripHeight() {
        // FIXME Make it more clear the getFilmstripHeight check is used in
        // horizontal film strip mode for calculating how tall large video
        // display should be.
        if (this.isFilmstripVisible() && !interfaceConfig.VERTICAL_FILMSTRIP) {
            return $(`.${this.filmstripContainerClassName}`).outerHeight();
        }

        return 0;
    },

    /**
     * Returns the width of filmstip
     * @returns {number} width
     */
    getFilmstripWidth() {
        return this.isFilmstripVisible()
            ? this.filmstrip.outerWidth()
                - parseInt(this.filmstrip.css('paddingLeft'), 10)
                - parseInt(this.filmstrip.css('paddingRight'), 10)
            : 0;
    },

    /**
     * Calculates the size for thumbnails: local and remote one
     * @returns {*|{localVideo, remoteVideo}}
     */
    calculateThumbnailSize() {
        const availableSizes = this.calculateAvailableSize();
        const width = availableSizes.availableWidth;
        const height = availableSizes.availableHeight;

        return this.calculateThumbnailSizeFromAvailable(width, height);
    },

    /**
     * Calculates available size for one thumbnail according to
     * the current window size.
     *
     * @returns {{availableWidth: number, availableHeight: number}}
     */
    calculateAvailableSize() {
        let availableHeight = interfaceConfig.FILM_STRIP_MAX_HEIGHT;
        const thumbs = this.getThumbs(true);
        const numvids = thumbs.remoteThumbs.length;

        const localVideoContainer = $('#localVideoContainer');

        /**
         * If the videoAreaAvailableWidth is set we use this one to calculate
         * the filmstrip width, because we're probably in a state where the
         * filmstrip size hasn't been updated yet, but it will be.
         */
        const videoAreaAvailableWidth
            = UIUtil.getAvailableVideoWidth()
            - this._getFilmstripExtraPanelsWidth()
            - UIUtil.parseCssInt(this.filmstrip.css('right'), 10)
            - UIUtil.parseCssInt(this.filmstrip.css('paddingLeft'), 10)
            - UIUtil.parseCssInt(this.filmstrip.css('paddingRight'), 10)
            - UIUtil.parseCssInt(this.filmstrip.css('borderLeftWidth'), 10)
            - UIUtil.parseCssInt(this.filmstrip.css('borderRightWidth'), 10)
            - 5;

        let availableWidth = videoAreaAvailableWidth;

        // If local thumb is not hidden
        if (thumbs.localThumb) {
            availableWidth = Math.floor(
                videoAreaAvailableWidth - (
                    UIUtil.parseCssInt(
                        localVideoContainer.css('borderLeftWidth'), 10)
                    + UIUtil.parseCssInt(
                        localVideoContainer.css('borderRightWidth'), 10)
                    + UIUtil.parseCssInt(
                        localVideoContainer.css('paddingLeft'), 10)
                    + UIUtil.parseCssInt(
                        localVideoContainer.css('paddingRight'), 10)
                    + UIUtil.parseCssInt(
                        localVideoContainer.css('marginLeft'), 10)
                    + UIUtil.parseCssInt(
                        localVideoContainer.css('marginRight'), 10))
            );
        }

        // If the number of videos is 0 or undefined or we're in vertical
        // filmstrip mode we don't need to calculate further any adjustments
        // to width based on the number of videos present.
        if (numvids && !interfaceConfig.VERTICAL_FILMSTRIP) {
            const remoteVideoContainer = thumbs.remoteThumbs.eq(0);

            availableWidth = Math.floor(
                videoAreaAvailableWidth - (numvids * (
                    UIUtil.parseCssInt(
                        remoteVideoContainer.css('borderLeftWidth'), 10)
                    + UIUtil.parseCssInt(
                        remoteVideoContainer.css('borderRightWidth'), 10)
                    + UIUtil.parseCssInt(
                        remoteVideoContainer.css('paddingLeft'), 10)
                    + UIUtil.parseCssInt(
                        remoteVideoContainer.css('paddingRight'), 10)
                    + UIUtil.parseCssInt(
                        remoteVideoContainer.css('marginLeft'), 10)
                    + UIUtil.parseCssInt(
                        remoteVideoContainer.css('marginRight'), 10)))
            );
        }

        const maxHeight

            // If the MAX_HEIGHT property hasn't been specified
            // we have the static value.
            = Math.min(interfaceConfig.FILM_STRIP_MAX_HEIGHT || 120,
            availableHeight);

        availableHeight
            = Math.min(maxHeight, window.innerHeight - 18);

        return { availableWidth,
            availableHeight };
    },

    /**
     * Traverse all elements inside the filmstrip
     * and calculates the sum of all of them except
     * remote videos element. Used for calculation of
     * available width for video thumbnails.
     *
     * @returns {number} calculated width
     * @private
     */
    _getFilmstripExtraPanelsWidth() {
        const className = this.filmstripContainerClassName;
        let width = 0;

        $(`.${className}`)
            .children()
            .each(function() {
                /* eslint-disable no-invalid-this */
                if (this.id !== 'remoteVideos') {
                    width += $(this).outerWidth();
                }
                /* eslint-enable no-invalid-this */
            });

        return width;
    },

    /**
     Calculate the thumbnail size in order to fit all the thumnails in passed
     * dimensions.
     * NOTE: Here we assume that the remote and local thumbnails are with the
     * same height.
     * @param {int} availableWidth the maximum width for all thumbnails
     * @param {int} availableHeight the maximum height for all thumbnails
     * @returns {{localVideo, remoteVideo}}
     */
    calculateThumbnailSizeFromAvailable(availableWidth, availableHeight) {
        /**
         * Let:
         * lW - width of the local thumbnail
         * rW - width of the remote thumbnail
         * h - the height of the thumbnails
         * remoteRatio - width:height for the remote thumbnail
         * localRatio - width:height for the local thumbnail
         * remoteThumbsInRow - number of remote thumbnails in a row (we have
         * only one local thumbnail) next to the local thumbnail. In vertical
         * filmstrip mode, this will always be 0.
         *
         * Since the height for local thumbnail = height for remote thumbnail
         * and we know the ratio (width:height) for the local and for the
         * remote thumbnail we can find rW/lW:
         * rW / remoteRatio = lW / localRatio then -
         * remoteLocalWidthRatio = rW / lW = remoteRatio / localRatio
         * and rW = lW * remoteRatio / localRatio = lW * remoteLocalWidthRatio
         * And the total width for the thumbnails is:
         * totalWidth = rW * remoteThumbsInRow + lW
         * = lW * remoteLocalWidthRatio * remoteThumbsInRow + lW =
         * lW * (remoteLocalWidthRatio * remoteThumbsInRow + 1)
         * and the h = lW/localRatio
         *
         * In order to fit all the thumbails in the area defined by
         * availableWidth * availableHeight we should check one of the
         * following options:
         * 1) if availableHeight == h - totalWidth should be less than
         * availableWidth
         * 2) if availableWidth ==  totalWidth - h should be less than
         * availableHeight
         *
         * 1) or 2) will be true and we are going to use it to calculate all
         * sizes.
         *
         * if 1) is true that means that
         * availableHeight/h > availableWidth/totalWidth otherwise 2) is true
         */

        const remoteThumbsInRow = interfaceConfig.VERTICAL_FILMSTRIP
            ? 0 : this.getThumbs(true).remoteThumbs.length;
        const remoteLocalWidthRatio = interfaceConfig.REMOTE_THUMBNAIL_RATIO
            / interfaceConfig.LOCAL_THUMBNAIL_RATIO;
        const lW = Math.min(availableWidth
            / ((remoteLocalWidthRatio * remoteThumbsInRow) + 1), availableHeight
            * interfaceConfig.LOCAL_THUMBNAIL_RATIO);
        const h = lW / interfaceConfig.LOCAL_THUMBNAIL_RATIO;

        const remoteVideoWidth = lW * remoteLocalWidthRatio;

        let localVideo;

        if (interfaceConfig.VERTICAL_FILMSTRIP) {
            localVideo = {
                thumbWidth: remoteVideoWidth,
                thumbHeight: h * remoteLocalWidthRatio
            };
        } else {
            localVideo = {
                thumbWidth: lW,
                thumbHeight: h
            };
        }

        return {
            localVideo,
            remoteVideo: {
                thumbWidth: remoteVideoWidth,
                thumbHeight: h
            }
        };
    },

    /**
     * Resizes thumbnails
     * @param local
     * @param remote
     * @param animate
     * @param forceUpdate
     * @returns {Promise}
     */
    // eslint-disable-next-line max-params
    resizeThumbnails(local, remote, animate = false, forceUpdate = false) {
        return new Promise(resolve => {
            const thumbs = this.getThumbs(!forceUpdate);
            const promises = [];

            if (thumbs.localThumb) {
                // eslint-disable-next-line no-shadow
                promises.push(new Promise(resolve => {
                    thumbs.localThumb.animate({
                        height: local.thumbHeight,
                        'min-height': local.thumbHeight,
                        'min-width': local.thumbWidth,
                        width: local.thumbWidth
                    }, this._getAnimateOptions(animate, resolve));
                }));
            }
            if (thumbs.remoteThumbs) {
                // eslint-disable-next-line no-shadow
                promises.push(new Promise(resolve => {
                    thumbs.remoteThumbs.animate({
                        height: remote.thumbHeight,
                        'min-height': remote.thumbHeight,
                        'min-width': remote.thumbWidth,
                        width: remote.thumbWidth
                    }, this._getAnimateOptions(animate, resolve));
                }));
            }
            // eslint-disable-next-line no-shadow
            promises.push(new Promise(resolve => {
                // Let CSS take care of height in vertical filmstrip mode.
                if (interfaceConfig.VERTICAL_FILMSTRIP) {
                    $('#filmstripLocalVideo').animate({
                        // adds 4 px because of small video 2px border
                        width: local.thumbWidth + 4
                    }, this._getAnimateOptions(animate, resolve));
                } else {
                    this.filmstrip.animate({
                        // adds 4 px because of small video 2px border
                        height: remote.thumbHeight + 4
                    }, this._getAnimateOptions(animate, resolve));
                }
            }));

            promises.push(new Promise(() => {
                const { localThumb } = this.getThumbs();
                const height = localThumb ? localThumb.height() : 0;
                const fontSize = UIUtil.getIndicatorFontSize(height);

                this.filmstrip.find('.indicator').animate({
                    fontSize
                }, this._getAnimateOptions(animate, resolve));
            }));

            if (!animate) {
                resolve();
            }

            Promise.all(promises).then(resolve);
        });
    },

    /**
     * Helper method. Returns options for jQuery animation
     * @param animate {Boolean} - animation flag
     * @param cb {Function} - complete callback
     * @returns {Object} - animation options object
     * @private
     */
    _getAnimateOptions(animate, cb = $.noop) {
        return {
            queue: false,
            duration: animate ? 500 : 0,
            complete: cb
        };
    },

    /**
     * Returns thumbnails of the filmstrip
     * @param onlyVisible
     * @returns {object} thumbnails
     */
    getThumbs(onlyVisible = false) {
        let selector = 'span';

        if (onlyVisible) {
            selector += ':visible';
        }

        const localThumb = $('#localVideoContainer');
        const remoteThumbs = this.filmstripRemoteVideos.children(selector);

        // Exclude the local video container if it has been hidden.
        if (localThumb.hasClass('hidden')) {
            return { remoteThumbs };
        }

        return { remoteThumbs,
            localThumb };

    }
};

export default Filmstrip;
