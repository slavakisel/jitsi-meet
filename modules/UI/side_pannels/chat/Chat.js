/* global APP, $ */

import CommandsProcessor from './Commands';

import UIUtil from '../../util/UIUtil';
import UIEvents from '../../../../service/UI/UIEvents';

import { smileys } from './smileys';

let unreadMessages = 0;
const sidePanelsContainerId = 'sideToolbarContainer';
const htmlStr = `
    <div id="chat_container" class="sideToolbarContainer__inner">
        <div id="nickname">
            <span data-i18n="chat.nickname.title"></span>
            <form>
                <input type='text'
                       class="input-control" id="nickinput" autofocus
                    data-i18n="[placeholder]chat.nickname.popover">
            </form>
        </div>

        <div id="chatconversation"></div>
        <audio id="chatNotification" src="sounds/incomingMessage.wav"
            preload="auto"></audio>
        <textarea id="usermsg" autofocus
            data-i18n="[placeholder]chat.messagebox"></textarea>
        <div id="smileysarea">
            <div id="smileys">
                <img src="images/smile.svg"/>
            </div>
        </div>
    </div>`;

/**
 *
 */
function initHTML() {
    $(`#${sidePanelsContainerId}`)
        .append(htmlStr);
}

/**
 * The container id, which is and the element id.
 */
const CHAT_CONTAINER_ID = 'chat_container';

/**
 *  Updates visual notification, indicating that a message has arrived.
 */
function updateVisualNotification() {
    // XXX The rewrite of the toolbar in React delayed the availability of the
    // element unreadMessages. In order to work around the delay, I introduced
    // and utilized unreadMsgSelector in addition to unreadMsgElement.
    const unreadMsgSelector = $('#unreadMessages');
    const unreadMsgElement
        = unreadMsgSelector.length > 0 ? unreadMsgSelector[0] : undefined;

    if (unreadMessages && unreadMsgElement) {
        unreadMsgElement.innerHTML = unreadMessages.toString();

        const chatButtonElement
            = document.getElementById('toolbar_button_chat');
        const leftIndent
            = (UIUtil.getTextWidth(chatButtonElement)
                - UIUtil.getTextWidth(unreadMsgElement)) / 2;
        const topIndent
            = ((UIUtil.getTextHeight(chatButtonElement)
                - UIUtil.getTextHeight(unreadMsgElement)) / 2) - 5;

        unreadMsgElement.setAttribute(
                'style',
                `top:${topIndent}; left:${leftIndent};`);
    } else {
        unreadMsgSelector.html('');
    }

    if (unreadMsgElement) {
        unreadMsgSelector.parent()[unreadMessages > 0 ? 'show' : 'hide']();
    }
}

/**
 *
 */
function toggleSmileys() {
    const smileys = $('#smileysContainer'); // eslint-disable-line no-shadow

    smileys.slideToggle();

    $('#usermsg').focus();
}

/**
 *
 */
function addClickFunction(smiley, number) {
    smiley.onclick = function addSmileyToMessage() {
        const usermsg = $('#usermsg');
        let message = usermsg.val();

        message += smileys[`smiley${number}`];
        usermsg.val(message);
        usermsg.get(0).setSelectionRange(message.length, message.length);
        toggleSmileys();
        usermsg.focus();
    };
}

/**
 * Adds the smileys container to the chat
 */
function addSmileys() {
    const smileysContainer = document.createElement('div');

    smileysContainer.id = 'smileysContainer';
    for (let i = 1; i <= 21; i++) {
        const smileyContainer = document.createElement('div');

        smileyContainer.id = `smiley${i}`;
        smileyContainer.className = 'smileyContainer';
        const smiley = document.createElement('img');

        smiley.src = `images/smileys/smiley${i}.svg`;
        smiley.className = 'smiley';
        addClickFunction(smiley, i);
        smileyContainer.appendChild(smiley);
        smileysContainer.appendChild(smileyContainer);
    }

    $('#chat_container').append(smileysContainer);
}

/**
 * Resizes the chat conversation.
 */
function resizeChatConversation() {
    const msgareaHeight = $('#usermsg').outerHeight();
    const chatspace = $(`#${CHAT_CONTAINER_ID}`);
    const width = chatspace.width();
    const chat = $('#chatconversation');
    const smileys = $('#smileysarea'); // eslint-disable-line no-shadow

    smileys.height(msgareaHeight);
    $('#smileys').css('bottom', (msgareaHeight - 26) / 2);
    $('#smileysContainer').css('bottom', msgareaHeight);
    chat.width(width - 10);
    chat.height(window.innerHeight - 15 - msgareaHeight);
}

/**
 * Focus input after 400 ms
 * Found input by id
 *
 * @param id {string} input id
 */
function deferredFocus(id) {
    setTimeout(() => $(`#${id}`).focus(), 400);
}

/**
 * Chat related user interface.
 */
const Chat = {
    /**
     * Initializes chat related interface.
     */
    init(eventEmitter) {
        initHTML();
        if (APP.conference.getLocalDisplayName()) {
            Chat.setChatConversationMode(true);
        }

        $('#smileys').click(() => {
            Chat.toggleSmileys();
        });

        $('#nickinput').keydown(function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                const val = this.value; // eslint-disable-line no-invalid-this

                this.value = '';// eslint-disable-line no-invalid-this
                eventEmitter.emit(UIEvents.NICKNAME_CHANGED, val);
                deferredFocus('usermsg');
            }
        });

        const usermsg = $('#usermsg');

        usermsg.keydown(function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                const value = this.value; // eslint-disable-line no-invalid-this

                usermsg.val('').trigger('autosize.resize');
                this.focus();// eslint-disable-line no-invalid-this
                const command = new CommandsProcessor(value, eventEmitter);

                if (command.isCommand()) {
                    command.processCommand();
                } else {
                    const message = UIUtil.escapeHtml(value);

                    eventEmitter.emit(UIEvents.MESSAGE_CREATED, message);
                }
            }
        });

        const onTextAreaResize = function() {
            resizeChatConversation();
            Chat.scrollChatToBottom();
        };

        usermsg.autosize({ callback: onTextAreaResize });

        eventEmitter.on(UIEvents.SIDE_TOOLBAR_CONTAINER_TOGGLED,
            (containerId, isVisible) => {
                if (containerId !== CHAT_CONTAINER_ID || !isVisible) {
                    return;
                }

                unreadMessages = 0;
                updateVisualNotification();

                // if we are in conversation mode focus on the text input
                // if we are not, focus on the display name input
                deferredFocus(
                    APP.conference.getLocalDisplayName()
                        ? 'usermsg'
                        : 'nickinput');
            });

        addSmileys();
        updateVisualNotification();
    },

    /**
     * Sets the chat conversation mode.
     * Conversation mode is the normal chat mode, non conversation mode is
     * where we ask user to input its display name.
     * @param {boolean} isConversationMode if chat should be in
     * conversation mode or not.
     */
    setChatConversationMode(isConversationMode) {
        $(`#${CHAT_CONTAINER_ID}`)
            .toggleClass('is-conversation-mode', isConversationMode);
    },

    /**
     * Resizes the chat area.
     */
    resizeChat(width, height) {
        $(`#${CHAT_CONTAINER_ID}`).width(width)
.height(height);

        resizeChatConversation();
    },

    /**
     * Indicates if the chat is currently visible.
     */
    isVisible() {
        return UIUtil.isVisible(
            document.getElementById(CHAT_CONTAINER_ID));
    },

    /**
     * Shows and hides the window with the smileys
     */
    toggleSmileys,

    /**
     * Scrolls chat to the bottom.
     */
    scrollChatToBottom() {
        setTimeout(
            () => {
                const chatconversation = $('#chatconversation');

                // XXX Prevent TypeError: undefined is not an object when the
                // Web browser does not support WebRTC (yet).
                chatconversation.length > 0
                    && chatconversation.scrollTop(
                            chatconversation[0].scrollHeight);
            },
            5);
    }
};

export default Chat;
