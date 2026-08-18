/**
 * ===========================================================================
 * ENGLISH DICTIONARY — the single source of truth for every word on the site
 * ===========================================================================
 * This file defines the *shape* of a translation. `zh-Hant.ts` mirrors it.
 * If you add a key here, TypeScript will let you add it to the Chinese file
 * too — and if you forget, English is used automatically.
 *
 * Grouped by where the text appears, so you can find things quickly.
 * ===========================================================================
 */
export const en = {
  /** Text used by assistive technology and browser chrome. */
  meta: {
    homeTitle: "Shue Yan University History Museum",
    homeDescription:
      "A permanent exhibition on the founders of Hong Kong Shue Yan University and the evolution of Hong Kong's higher education system.",
    bookingTitle: "Exhibition Visit Booking",
    bookingDescription:
      "Reserve your visit to the Shue Yan University History Museum. Booking takes about two minutes.",
    skipToContent: "Skip to main content",
  },

  /** The dark green bar at the top of every page. */
  header: {
    museumNameChinese: "樹仁大學校史館",
    museumNameEnglish: "Shue Yan University History Museum",
    /** Screen-reader name for the <nav> landmark. */
    primaryNavLabel: "Main",
    /** Screen-reader name for the language <nav> landmark. */
    languageNavLabel: "Language",
    /** Announced when the language switcher is used. */
    languageSwitchTo: "Switch to",
    /** Marks whichever language is already active. */
    currentLanguage: "Current language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    homeLinkLabel: "Shue Yan University History Museum — go to home page",
  },

  /** Labels for the main navigation. Keys match MAIN_NAV in config/site.ts. */
  nav: {
    home: "Home",
    about: "About",
    visit: "Visit",
  },

  /** The cream strip under the header on the home page. */
  announcement: {
    /** Names the <aside> landmark so it can be skipped or jumped to. */
    regionLabel: "Announcement",
    message: "Book Your Visit Now",
    cta: "Register",
    /** Full, unambiguous link text for screen readers. */
    ctaAccessibleLabel: "Register — book your museum visit",
  },

  /** The brown warning strip at the top of the booking page. */
  bookingNotice: {
    regionLabel: "Important notice",
    text: "Please ensure all information is accurate to avoid any inconvenience on the day of your visit.",
  },

  /** Home page content. */
  home: {
    heroImageAlt:
      "The museum's entrance corridor, with teal exhibition walls and large Chinese characters reading 敦仁博物 — cultivating virtues of benevolence, broadening horizon and knowledge.",
    welcomeTitle: "Welcome to SYU History Museum",
    welcomeBody:
      "Shue Yan University History Museum presents a permanent exhibition on the lifelong dedication of founders Dr. Henry Hu Hung Lick and Dr. Chung Chi-yung to education, social welfare, and community development. Through their pioneering journey, the exhibition also offers a critical lens on the broader evolution of Hong Kong's higher education system — its challenges, transformations, and changing societal roles over time.",
    learnMore: "Learn More",
    learnMoreAccessibleLabel: "Learn more about the museum and its founders",
    /** Screen-reader heading for the three-card row (not shown on screen). */
    exploreHeading: "Explore the museum",
    cards: {
      collection: "Collection",
      events: "Events",
      materials: "Materials",
      /** Alt text for each card image. */
      collectionImageAlt:
        "A black-and-white photograph of an early Shue Yan College ceremony.",
      eventsImageAlt: "Students taking part in an on-campus exhibition event.",
      materialsImageAlt:
        "Teal museum leaflets printed with the characters 敦仁 and 博物.",
    },
  },

  /** The dark footer shared by every page. */
  footer: {
    /** Screen-reader name for the <footer> landmark. */
    label: "Site footer",
    openingHoursTitle: "Opening Hours",
    contactTitle: "Contact Us",
    hoursTueThu: "Tuesday to Thursday: 10am – 5pm",
    hoursFriSun: "Friday to Sunday: 10am – 6pm",
    hoursClosed: "Closed on Mondays",
    viewOnMaps: "View on Google Maps",
    /** Appended for screen readers so people know the link leaves the site. */
    opensInNewTab: "opens in a new tab",
    backToTop: "Return to the top",
    copyright: "Copyright © 2026 Shue Yan University History Museum. All Rights Reserved.",
  },

  /** Everything inside the three-step booking flow. */
  booking: {
    pageTitle: "Exhibition Visit Booking",
    backToVisit: "Back to Plan Your Visit",
    backToDetails: "Back to your details",

    /** The progress indicator above the form. */
    steps: {
      label: "Booking progress",
      of: "Step {current} of {total}",
      details: "Your details",
      review: "Review and confirm",
      done: "Confirmed",
    },

    /* ------------------------------- STEP 1 ------------------------------ */
    guestInformation: "Guest Information",
    /** The little red legend next to the section heading. */
    requiredLegend: "must fill",
    /** Read out by screen readers after every required field's label. */
    requiredFieldSuffix: "required",

    fields: {
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      phoneCountryCode: "Country code",
      email: "Email Address",
      emailHelp:
        "Please ensure this is your regularly used email address, as the confirmation letter will be sent to this email.",
      date: "Pick Date of Visitation",
      guests: "Number of Guest(s)",
      referral: "How You Heard About Us",
      referralPlaceholder: "Please choose an option",
    },

    /** Names of the phone country codes, keyed by PHONE_COUNTRY_CODES.labelKey. */
    countries: {
      hongKong: "Hong Kong",
      mainlandChina: "Mainland China",
      macau: "Macau",
      taiwan: "Taiwan",
      unitedKingdom: "United Kingdom",
      unitedStatesCanada: "United States / Canada",
    },

    /** Options for "How You Heard About Us", keyed by REFERRAL_SOURCES.labelKey. */
    referralOptions: {
      socialMedia: "Social media",
      universityWebsite: "University website",
      friendFamilyColleague: "Friend / family / colleague",
      campusPosters: "On-campus posters or banners",
      emailNewsletter: "Email / newsletter",
      searchEngine: "Search engine",
      other: "Other",
    },

    /** The guest-count stepper. */
    stepper: {
      decrease: "Remove one guest",
      increase: "Add one guest",
      /** Announced politely whenever the number changes. */
      announce: "{count} guests selected",
      announceOne: "1 guest selected",
    },

    /** The accessible calendar. */
    calendar: {
      label: "Choose the date of your visit",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      selectedPrefix: "Date of Visitation:",
      noDateChosen: "No date chosen yet",
      closedSuffix: "closed",
      unavailableSuffix: "unavailable",
      selected: "selected",
      /** Keyboard help shown under the calendar. */
      keyboardHint:
        "Use the arrow keys to move between dates, then press Enter or Space to choose one.",
      weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      weekdaysNarrow: ["S", "M", "T", "W", "T", "F", "S"],
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
    },

    next: "Next",

    /* ------------------------------- STEP 2 ------------------------------ */
    review: {
      name: "Name",
      phone: "Phone Number",
      email: "Email Address",
      guests: "Number of Guest(s)",
      date: "Date of Visitation",
      referral: "How You Heard About Us",
      /** Small link next to each answer so people can go back and fix it. */
      edit: "Edit",
      editField: "Edit {field}",
    },
    termsTitle: "Terms and Conditions",
    /**
     * The Terms and Conditions shown inside the booking card.
     * Structured as groups so headings stay real <h4> elements and the rules
     * stay a real <ul> — screen readers can then jump between sections.
     */
    termsSections: [
      {
        heading: "Reservations",
        items: [
          "Entry to the Shue Yan University History Museum is prioritised for visitors with a confirmed reservation.",
          "Walk-in visitors will be admitted only if capacity allows.",
          "Admission Ticket Visitors must present the admission ticket attached to the confirmation email at the entrance. Entry will not be granted without a valid ticket.",
        ],
      },
      {
        heading: "Identification",
        items: ["Visitors may be required to present a valid form of identification upon entry."],
      },
      {
        heading: "Opening Hours & Capacity",
        items: [
          "The Museum reserves the right to limit the number of visitors and adjust opening arrangements when necessary.",
        ],
      },
      {
        heading: "Conduct",
        items: [
          "Visitors are expected to behave respectfully within the Museum. The Museum reserves the right to refuse entry or ask visitors to leave if their behaviour is disruptive or inappropriate.",
        ],
      },
      {
        heading: "Photography",
        items: [
          "Personal photography is generally permitted for non-commercial use, unless otherwise indicated in specific exhibition areas. Flash photography and tripods may be restricted.",
        ],
      },
      {
        heading: "Liability",
        items: [
          "The Museum is not responsible for any loss, damage, or injury incurred during the visit, except where required by law.",
        ],
      },
      {
        heading: "Changes",
        items: [
          "The Museum reserves the right to amend these terms, exhibition content, or visiting arrangements without prior notice.",
        ],
      },
    ],
    termsConsent:
      "By submitting this registration, I confirm that I have read, understood, and agree to the Museum's Terms and Conditions.",
    submit: "Submit",
    submitting: "Submitting your booking…",

    /* ------------------------------- STEP 3 ------------------------------ */
    success: {
      title: "Your visit is booked",
      /** Announced immediately to screen-reader users on success. */
      announcement: "Booking confirmed.",
      intro:
        "Thank you. Your reservation is confirmed and a confirmation email with your admission ticket is on its way.",
      referenceLabel: "Booking reference",
      emailSentTo: "We sent your confirmation to",
      emailDelayNote:
        "The email can take a few minutes to arrive. Please check your spam folder before contacting us.",
      whatNextTitle: "Before you visit",
      whatNext: [
        "Bring the admission ticket from your confirmation email — printed or on your phone.",
        "You may be asked to show a valid form of identification on entry.",
        "Arrive during opening hours; the museum is closed on Mondays.",
      ],
      bookAnother: "Make another booking",
      backHome: "Return to the home page",
      /** Shown if the booking saved but the email could not be sent. */
      emailFailed:
        "Your booking is saved, but we could not send the confirmation email. Please contact us at {email} quoting your booking reference.",
    },

    /* ------------------------------ MESSAGES ----------------------------- */
    errors: {
      /** Heading of the error summary box that appears above the form. */
      summaryTitle: "There is a problem",
      summaryTitlePlural: "There are {count} problems",
      summaryHint: "Select a link below to go straight to the field.",
      firstNameRequired: "Enter your first name.",
      firstNameTooLong: "First name must be 60 characters or fewer.",
      lastNameRequired: "Enter your last name.",
      lastNameTooLong: "Last name must be 60 characters or fewer.",
      phoneRequired: "Enter your phone number.",
      phoneInvalid: "Enter a phone number using digits only, for example 1234 5678.",
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter an email address in the correct format, like name@example.com.",
      dateRequired: "Choose the date of your visit.",
      dateInPast: "Choose a date at least one day from today.",
      dateTooFar: "Choose a date within the next {days} days.",
      dateClosed: "The museum is closed on that date. Choose another day.",
      guestsRange: "Choose between {min} and {max} guests.",
      referralRequired: "Tell us how you heard about us.",
      termsRequired: "You must agree to the Terms and Conditions before submitting.",
      capacityFull:
        "Sorry — that date is fully booked. Only {remaining} place(s) are left. Please choose another date or reduce your party size.",
      /** Anything unexpected: a network drop, a database outage. */
      unexpected:
        "Something went wrong and your booking was not saved. Please try again in a moment.",
      /** Shown when the browser blocks the request entirely. */
      network: "We could not reach the museum's booking service. Check your connection and try again.",
    },
  },

  /** Wording shared by the placeholder pages (About, Visit, Collection, …). */
  placeholder: {
    comingSoonTitle: "Coming soon",
    comingSoonBody:
      "This page is still being written. In the meantime you can book a visit or return to the home page.",
    bookVisit: "Book your visit",
    backHome: "Return to the home page",
    visitTitle: "Plan Your Visit",
    visitBody:
      "Everything you need to know before you arrive: opening hours, how to find us, and how to reserve your place.",
    aboutTitle: "About the Museum",
    collectionTitle: "Collection",
    eventsTitle: "Events",
    materialsTitle: "Materials",
  },
} as const;

/**
 * ---------------------------------------------------------------------------
 * The contract every other language must follow.
 * ---------------------------------------------------------------------------
 * `as const` above is what lets TypeScript see the exact SHAPE of the
 * dictionary (which keys exist, which values are arrays). But it also freezes
 * every value to its exact English text — so `nav.home` would have the type
 * `"Home"` rather than `string`, and the Chinese "主頁" would be rejected.
 *
 * `Widen` relaxes those literal types back to plain `string` / `number` while
 * keeping the structure, so any language can satisfy the same shape.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : { readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
