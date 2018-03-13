import { getName } from '../app';
import { translateToHTML } from '../base/i18n';
import { browser } from '../base/lib-jitsi-meet';
import { showWarningNotification } from '../notifications';

export function showSuboptimalExperienceNotification(dispatch, t) {
  dispatch(
      showWarningNotification(
          {
              titleKey: 'notify.suboptimalExperienceTitle',
              description: translateToHTML(
                  t,
                  'notify.suboptimalExperienceDescription',
                  {
                      appName: getName()
                  })
          }
      )
  );
};


// Adding react native to the list of recommended browsers is not
// necessary for now because the function won't be executed at all
// in this case but I'm adding it for completeness.
// && !browser.isReactNative();
export function maybeSuboptimalExperience() {
    return !browser.isChrome()
        && !browser.isFirefox()
        && !browser.isNWJS()
        && !browser.isElectron();
};

/**
 * Shows the suboptimal experience notification if needed.
 *
 * @param {Function} dispatch - The dispatch method.
 * @param {Function} t - The translation function.
 * @returns {void}
 */
export function maybeShowSuboptimalExperienceNotification(dispatch, t) {
    if (maybeSuboptimalExperience()) {
        showSuboptimalExperienceNotification(dispatch, t);
    }
};
