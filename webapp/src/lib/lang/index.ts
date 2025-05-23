import { createI18n } from "vue-i18n";
import en from "./en.json";
import fr from "./fr.json";

function loadLocaleMessages() {
  const messages: any = {};
  messages["en"] = en;
  messages["fr"] = fr;
  return messages;
}

export const i18n = createI18n({
  locale: "fr",
  fallbackLocale: "en",
  messages: loadLocaleMessages(),
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  missingWarn: false,
  fallbackWarn: false,
  warnHtmlMessage: false,
  missing: (locale, key, _) => {
    console.warn(`Missing translation for ${key} in ${locale}`);
    return key;
  },
});
