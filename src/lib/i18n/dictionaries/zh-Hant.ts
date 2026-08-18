import type { Dictionary } from "./en";

/**
 * ===========================================================================
 * TRADITIONAL CHINESE DICTIONARY  (繁體中文)
 * ===========================================================================
 * HOW TO ADD CHINESE TO THE SITE
 * ---------------------------------------------------------------------------
 * 1. Open `en.ts` next to this file and copy any key you want to translate.
 * 2. Paste it here and replace the English text with Chinese.
 * 3. Save. That is the whole job — no component needs to change.
 *
 * You do NOT have to translate everything at once. `mergeDictionary()` in
 * `../index.ts` layers this file on top of English, so any key you leave out
 * simply shows the English wording until you get to it.
 *
 * The sections below are already done as a working example; the rest are
 * waiting for the museum's official Chinese copy.
 * ===========================================================================
 */

/** A version of the dictionary where every key is optional, at every depth. */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly (infer U)[]
    ? readonly U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export const zhHant: DeepPartial<Dictionary> = {
  meta: {
    homeTitle: "香港樹仁大學校史館",
    bookingTitle: "展覽參觀預約",
    skipToContent: "跳至主要內容",
  },

  header: {
    museumNameChinese: "樹仁大學校史館",
    museumNameEnglish: "Shue Yan University History Museum",
    primaryNavLabel: "主要",
    languageNavLabel: "語言",
    languageSwitchTo: "切換至",
    currentLanguage: "目前語言",
    openMenu: "開啟選單",
    closeMenu: "關閉選單",
  },

  nav: {
    home: "主頁",
    about: "關於我們",
    visit: "參觀資訊",
  },

  announcement: {
    regionLabel: "公告",
    message: "立即預約參觀",
    cta: "登記",
  },

  bookingNotice: {
    regionLabel: "重要提示",
    text: "請確保所有資料正確無誤，以免影響您當日的參觀。",
  },

  home: {
    welcomeTitle: "歡迎蒞臨樹仁大學校史館",
    learnMore: "了解更多",
    cards: {
      collection: "館藏",
      events: "活動",
      materials: "資料",
    },
  },

  footer: {
    openingHoursTitle: "開放時間",
    contactTitle: "聯絡我們",
    hoursTueThu: "星期二至星期四：上午10時至下午5時",
    hoursFriSun: "星期五至星期日：上午10時至下午6時",
    hoursClosed: "星期一休館",
    viewOnMaps: "在 Google 地圖上檢視",
    opensInNewTab: "於新分頁開啟",
    backToTop: "返回頁首",
  },

  booking: {
    pageTitle: "展覽參觀預約",
    guestInformation: "訪客資料",
    requiredLegend: "必填",
    requiredFieldSuffix: "必填",
    fields: {
      firstName: "名字",
      lastName: "姓氏",
      phone: "聯絡電話",
      email: "電郵地址",
      date: "選擇參觀日期",
      guests: "參觀人數",
      referral: "您從何處得知我們",
    },
    next: "下一步",
    submit: "提交",
    termsTitle: "條款及細則",
    success: {
      title: "預約已完成",
      referenceLabel: "預約編號",
    },
  },
};
