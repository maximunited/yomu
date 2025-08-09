export type Language = 'he' | 'en';

export interface Translations {
  // Navigation
  home: string;
  dashboard: string;
  memberships: string;
  profile: string;
  notifications: string;
  signIn: string;
  signUp: string;
  signOut: string;
  back: string;
  settings: string;
  logout: string;
  
  // Common
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  copy: string;
  copied: string;
  moreDetails: string;
  saving: string;
  saveChanges: string;
  unsavedChangesWarning: string;
  loading: string;
  
  // Landing Page
  appName: string;
  appTagline: string;
  getStarted: string;
  learnMore: string;
  allRightsReserved: string;
  heroTitle: string;
  heroDescription: string;
  feature1Title: string;
  feature1Description: string;
  feature2Title: string;
  feature2Description: string;
  feature3Title: string;
  feature3Description: string;
  statsBrands: string;
  statsBenefits: string;
  statsUsers: string;
  statsSaved: string;
  
  // Auth
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  signInWithGoogle: string;
  signUpWithGoogle: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  createAccount: string;
  
  // Onboarding
  welcomeTitle: string;
  welcomeSubtitle: string;
  selectMemberships: string;
  selectMembershipsDescription: string;
  continue: string;
  
  // Dashboard
  myBenefits: string;
  activeNow: string;
  comingSoon: string;
  noActiveBenefits: string;
  noUpcomingBenefits: string;
  couponCode: string;
  validUntil: string;
  expiresIn: string;
  
  // Memberships
  manageMemberships: string;
  membershipsDescription: string;
  activeMemberships: string;
  totalMemberships: string;
  selectedPrograms: string;
  moreProgramsMoreBenefits: string;
  addCustomMembership: string;
  customMembershipName: string;
  customMembershipDescription: string;
  customMembershipCategory: string;
  
  // Profile
  profileSettings: string;
  personalInformation: string;
  notificationSettings: string;
  privacyPolicy: string;
  termsOfService: string;
  contactUs: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  emailNotifications: string;
  emailNotificationsDescription: string;
  pushNotifications: string;
  pushNotificationsDescription: string;
  smsNotifications: string;
  smsNotificationsDescription: string;
  fullName: string;
  anniversaryDate: string;
  optional: string;
  profilePicture: string;
  clickToChange: string;
  editProfile: string;
  emailPermanent: string;
  appearance: string;
  darkMode: string;
  lightMode: string;
  darkModeDescription: string;
  language: string;
  interfaceLanguage: string;
  languageDescription: string;
  fullySupported: string;
  betaLanguages: string;
  betaLanguagesNote: string;
  
  // Notifications
  notificationsTitle: string;
  markAsRead: string;
  markAllAsRead: string;
  noNotifications: string;
  newNotificationsCount: string; // expects {count}
  noNewNotifications: string;
  newBenefit: string;
  benefitExpiring: string;
  birthdayMonthStart: string;
  
  // Benefit Details
  benefitDetails: string;
  termsAndConditions: string;
  howToRedeem: string;
  visitWebsite: string;
  buyOnBrandWebsite?: string;
  officialBrandWebsite?: string;
  
  // Categories
  fashion: string;
  food: string;
  health: string;
  homeCategory: string;
  finance: string;
  grocery: string;
  transport: string;
  entertainment: string;
  convenience: string;
  baby: string;
  
  // Footer
  privacy: string;
  terms: string;
  contact: string;
  
  // Static Text
  backToHome: string;
  termsOfUse: string;
  validOnlyOnBirthday: string;
  validForEntireMonth: string;
  validForWeek: string;
  validForLimitedPeriod: string;
  discountOnAllPurchases: string;
  specialBirthdayDiscount: string;
  return: string;
  activeOutOfTotal: string;
  selectAllMemberships: string;
  programsSelected: string;
  chooseCategory: string;
  addMembership: string;
  changesSavedSuccessfully: string;
  contactInformation: string;
  subject: string;
  message: string;
  workingHours: string;
  address: string;
  phone: string;
  chooseSubject: string;
  technicalSupport: string;
  improvementSuggestion: string;
  bugReport: string;
  generalQuestion: string;
  writeYourMessageHere: string;
  enterYourFullName: string;
  yourEmail: string;
  reportIncorrectInfo: string;
  thankYouForReporting: string;
  weWillCheckAndUpdate: string;
  newBenefitsAvailable: string;
  benefitExpiresInDays: string;
  addedNewBenefit: string;
  newBenefitFrom: string;
  hoursAgo: string;
  daysAgo: string;
  ago: string;
  
  // About Page
  about: string;
  aboutTitle: string;
  aboutDescription: string;
  mission: string;
  missionDescription: string;
  vision: string;
  visionDescription: string;
  team: string;
  contributors: string;
  contributorsDescription: string;
  
  // Team Members
  leadDeveloper: string;
  uxDesigner: string;
  productManager: string;
  contentContributors: string;
  contentContributorsDescription: string;
  qualityAssurance: string;
  qualityAssuranceDescription: string;
  
  // Terms Page
  termsAcceptance: string;
  termsAcceptanceDescription: string;
  serviceUsage: string;
  serviceUsageDescription: string;
  liability: string;
  liabilityDescription: string;
  termsChanges: string;
  termsChangesDescription: string;
  accountCancellation: string;
  accountCancellationDescription: string;
  
  // Privacy Page
  dataCollection: string;
  dataCollectionDescription: string;
  security: string;
  securityDescription: string;
  userRights: string;
  userRightsDescription: string;
  policyUpdates: string;
  policyUpdatesDescription: string;
  
  // Contact Page
  contactAddress: string;
  contactPhone: string;
  workingHoursValue: string;
  sendMessage: string;
  
  // Membership Types
  free: string;
  paid: string;
  membershipType: string;
  membershipCost: string;
  costDetails: string;
  
  // Search and Filter
  search: string;
  searchPlaceholder: string;
  filterBy: string;
  allCategories: string;
  quickFilters: string;
  
  // Multi-brand Partnerships
  includesAccessTo: string;
  additionalBrands: string;
  showBrandList: string;
  partnerships: string;
  partners: string;
  partnerBrands: string;
  
  // New Services
  escapeRoom: string;
  escapeRoomBenefit: string;
  bacaroRestaurant: string;
  bacaroBenefit: string;
  shegevRestaurant: string;
  shegevBenefit: string;
  jamesBeer: string;
  jamesBenefit: string;
  pragRestaurant: string;
  pragBenefit: string;
  mikaConvenience: string;
  mikaBenefit: string;
  kfcBenefit: string;
  manamDIY: string;
  manamBenefit: string;
  shilav: string;
  shilavBenefit: string;
  youmangus: string;
  youmangusBenefit: string;
  m32Burgers: string;
  m32BurgersBenefit: string;
  libiraRestaurant: string;
  libiraRestaurantBenefit: string;
  
  // Onboarding page
  onboardingTitle: string;
  onboardingDescription: string;
  onboardingSelectAtLeastOne: string;
  onboardingSaveError: string;
  onboardingContinueToDashboard: string;
  onboardingSkipForNow: string;
  onboardingSelectedCount: string;
  onboardingSaving: string;
  
  // Brand descriptions
  brandDescriptionFashion: string;
  brandDescriptionHealth: string;
  brandDescriptionFood: string;
  brandDescriptionHome: string;
  brandDescriptionFinance: string;
  brandDescriptionCoffee: string;
  brandDescriptionGrocery: string;
  
  // Dashboard categories
  categoryFashion: string;
  categoryFood: string;
  categoryHealth: string;
  categoryHome: string;
  categoryFinance: string;
  categoryGrocery: string;
  categoryEntertainment: string;
  categoryConvenience: string;
  categoryTransport: string;
  categoryBaby: string;
  
  // Validity durations
  validityExactDate: string;
  validityEntireMonth: string;
  validityWeekBeforeAfter: string;
  validityWeekend: string;
  validity30Days: string;
  validity7DaysBefore: string;
  validity7DaysAfter: string;
  validity3DaysBefore: string;
  validity3DaysAfter: string;
  validityLimitedPeriod: string;
  
  // Language abbreviations
  languageAbbreviationHebrew: string;
  languageAbbreviationEnglish: string;
  
  // Page titles
  pageTitle: string;
  
  // Dashboard UI elements
  user: string;
  personalProfile: string;
  appearanceAndLanguage: string;
  account: string;
  accountManagement: string;
  helloUser: string;
  hereAreYourBirthdayBenefits: string;
  
  // Signup page
  passwordsDoNotMatch: string;
  passwordMinLength: string;
  registrationError: string;
  autoLoginError: string;
  googleRegistrationError: string;
  
  // Dashboard filtering
  searchAndFilter: string;
  showFilters: string;
  hideFilters: string;
  category: string;
  validityPeriod: string;
  allPeriods: string;
  
  // Dashboard additional UI
  allTypes: string;
  categoryLabel: string;
  periodLabel: string;
  typeLabel: string;
  buyNow: string;
  quickActions: string;
  
  // Notifications
  birthdayMonthStarted: string;
  birthdayMonthStartedMessage: string;
  benefitExpiringSoon: string;
  benefitExpiringMessage: string;
  newBenefitAvailable: string;
  
  // Signin page
  welcome: string;
  signInToYourAccount: string;
  invalidCredentials: string;
  signInError: string;
  googleSignInError: string;
  saveEmail: string;
  keepMeSignedIn: string;
  signingIn: string;
  or: string;
  signUpNow: string;
  signInWithGitHub: string;
  githubSignInError: string;
  githubSignUpError: string;
  signUpWithGitHub: string;
  
  // Used Benefits
  markAsUsed: string;
  unmarkAsUsed: string;
  usedBenefits: string;
  usedBenefitsDescription: string;
  noUsedBenefits: string;
  usedOn: string;
  addNotes: string;
  notes: string;
  markBenefitAsUsed: string;
  unmarkBenefitAsUsed: string;
  benefitUsedSuccessfully: string;
  benefitUnmarkedSuccessfully: string;
  usedBenefitsHistory: string;
  usedBenefitsHistoryDescription: string;
  
  // API Key
  apiKey: string;
  apiKeyDescription: string;
  editApiKey: string;
  saveApiKey: string;
  copyApiKey: string;
  apiKeyCopied: string;
  apiKeySaved: string;

  // API/Errors
  unauthorized: string;
  internalServerError: string;
  missingFields: string;
  userCreatedSuccessfully: string;
  passwordTooShort: string;
  userAlreadyExists: string;
  profileUpdatedSuccessfully: string;
  profileUpdateError: string;
  profileLoadError: string;
  userNotFound: string;
  customMembershipNotFound: string;
  customMembershipCreated: string;
  customMembershipUpdated: string;
  customMembershipDeleted: string;
  customMembershipIdRequired: string;
  benefitNotFound: string;

  // Benefit detail page
  description: string;
  benefitLoadError: string;
  benefitNotFoundDescription: string;
  backToDashboard: string;
  copyCouponCode: string;
  copiedToClipboard: string;
  buyNowTitle?: string;
  visitWebsiteTitle?: string;

  // Misc API test strings
  databaseSeedSuccess?: string;
  databaseSeedError?: string;
  prismaConnectionSuccess?: string;
  prismaConnectionFailed?: string;
  failedToFetchUsers?: string;
  benefitUnmarked?: string;
}

export const translations: Record<Language, Translations> = {
  he: {
    // Navigation
    home: 'בית',
    homeCategory: 'בית',
    dashboard: 'לוח בקרה',
    memberships: 'חברויות',
    profile: 'פרופיל',
    notifications: 'התראות',
    signIn: 'התחברות',
    signUp: 'הרשמה',
    signOut: 'התנתקות',
    back: 'חזרה',
    settings: 'הגדרות',
    logout: 'התנתקות',
    
    // Common
    save: 'שמור',
    cancel: 'ביטול',
    edit: 'ערוך',
    delete: 'מחק',
    copy: 'העתק',
    copied: 'הועתק',
    moreDetails: 'פרטים נוספים',
    loading: 'טוען...',
    saving: 'שומר...',
    saveChanges: 'שמור שינויים',
    unsavedChangesWarning: 'יש לך שינויים שלא נשמרו. אם תעזוב עכשיו השינויים יאבדו. האם אתה בטוח שברצונך לעזוב?',
    
    // Landing Page
    appName: 'YomU',
    appTagline: 'הטבות יום הולדת במקום אחד',
    getStarted: 'התחל עכשיו',
    learnMore: 'למידע נוסף',
    allRightsReserved: 'כל הזכויות שמורות',
    heroTitle: 'אל תפספסו אף הטבה ליום הולדת',
    heroDescription: 'מרכזים את כל ההטבות, הדילים והמתנות ליום הולדת במקום אחד. עקבו אחרי כל התוכניות שלכם וקבלו התראות בזמן אמת.',
    feature1Title: 'הטבות מרוכזות',
    feature1Description: 'כל ההטבות ליום הולדת מכל התוכניות שלכם במקום אחד',
    feature2Title: 'התראות חכמות',
    feature2Description: 'קבלו התראות בזמן אמת על הטבות חדשות ותזכורות',
    feature3Title: 'חיסכון בזמן',
    feature3Description: 'חסכו זמן וכסף - אל תפספסו אף הטבה ליום הולדת',
    statsBrands: 'מותגים',
    statsBenefits: 'הטבות',
    statsUsers: 'משתמשים',
    statsSaved: 'נחסך',
    
    // Auth
    email: 'אימייל',
    password: 'סיסמה',
    confirmPassword: 'אימות סיסמה',
    forgotPassword: 'שכחתי סיסמה',
    signInWithGoogle: 'התחבר עם Google',
    signUpWithGoogle: 'הירשם עם Google',
    alreadyHaveAccount: 'כבר יש לך חשבון?',
    dontHaveAccount: 'אין לך חשבון?',
    createAccount: 'צור חשבון',
    
    // Onboarding
    welcomeTitle: 'ברוכים הבאים ל-YomU!',
    welcomeSubtitle: 'בחרו את תוכניות החברות שלכם כדי להתחיל',
    selectMemberships: 'בחרו חברויות',
    selectMembershipsDescription: 'בחרו את כל תוכניות החברות שלכם כדי שנוכל להציג לכם את כל ההטבות ליום הולדת',
    continue: 'המשך',
    
    // Dashboard
    myBenefits: 'הטבות שלי',
    activeNow: 'פעיל עכשיו',
    comingSoon: 'בקרוב',
    noActiveBenefits: 'אין הטבות פעילות כרגע',
    noUpcomingBenefits: 'אין הטבות קרובות',
    couponCode: 'קוד קופון:',
    validUntil: 'תקף עד:',
    expiresIn: 'פג תוקף בעוד:',
    
    // Memberships
    manageMemberships: 'ניהול חברויות',
    membershipsDescription: 'בחרו את כל תוכניות החברות שלכם כדי שנוכל להציג לכם את כל ההטבות ליום הולדת',
    activeMemberships: 'חברויות פעילות',
    totalMemberships: 'סה"כ חברויות',
    selectedPrograms: 'נבחרו תוכניות',
    moreProgramsMoreBenefits: 'ככל שתבחרו יותר תוכניות, כך תקבלו יותר הטבות ליום הולדת',
    addCustomMembership: 'הוסף חברות מותאמת',
    customMembershipName: 'שם החברות',
    customMembershipDescription: 'תיאור',
    customMembershipCategory: 'קטגוריה',
    selectAllMemberships: 'בחר את כל החברויות',
    programsSelected: 'תוכניות נבחרו',
    addMembership: 'הוסף חברות',
    changesSavedSuccessfully: 'השינויים נשמרו בהצלחה',
    chooseCategory: 'בחר קטגוריה',
    
    // Profile
    profileSettings: 'הגדרות פרופיל',
    personalInformation: 'מידע אישי',
    notificationSettings: 'הגדרות התראות',
    privacyPolicy: 'מדיניות פרטיות',
    termsOfService: 'תנאי שימוש',
    contactUs: 'צור קשר',
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    dateOfBirth: 'תאריך לידה',
    phoneNumber: 'מספר טלפון',
    emailNotifications: 'התראות אימייל',
    emailNotificationsDescription: 'קבל התראות על הטבות חדשות ותזכורות ליום הולדת לכתובת האימייל שלך',
    pushNotifications: 'התראות דחיפה',
    pushNotificationsDescription: 'קבל התראות מיידיות על הטבות חדשות ותזכורות ליום הולדת במכשיר שלך',
    smsNotifications: 'התראות SMS',
    smsNotificationsDescription: 'קבל הודעות SMS על הטבות חדשות ותזכורות ליום הולדת למספר הטלפון שלך',
    fullName: 'שם מלא',
    anniversaryDate: 'תאריך נישואין',
    optional: 'אופציונלי',
    profilePicture: 'תמונת פרופיל',
    clickToChange: 'לחץ לשינוי',
    editProfile: 'ערוך פרופיל',
    emailPermanent: 'כתובת האימייל קבועה ולא ניתנת לשינוי',
    appearance: 'מראה',
    darkMode: 'מצב כהה',
    lightMode: 'מצב בהיר',
    darkModeDescription: 'שנה את מראה האפליקציה',
    language: 'שפה',
    interfaceLanguage: 'שפת הממשק',
    languageDescription: 'בחר את השפה המועדפת עליך',
    fullySupported: 'שפות נתמכות במלואן',
    betaLanguages: 'שפות בגרסת בטא',
    betaLanguagesNote: 'שפות בגרסת בטא עשויות להיות מתורגמות חלקית',
    
    
    // Notifications
    notificationsTitle: 'התראות',
    markAsRead: 'סמן כנקרא',
    markAllAsRead: 'סמן הכל כנקרא',
    noNotifications: 'אין התראות',
    newNotificationsCount: 'יש {count} התראות חדשות',
    noNewNotifications: 'אין התראות חדשות',
    newBenefit: 'הטבה חדשה',
    benefitExpiring: 'הטבה פוקעת',
    birthdayMonthStart: 'חודש יום הולדת התחיל',
    
    // Benefit Details
    benefitDetails: 'פרטי ההטבה',
    termsAndConditions: 'תנאים והגבלות',
    howToRedeem: 'איך לממש',
    visitWebsite: 'בקר באתר',
    buyOnBrandWebsite: 'לקנייה באתר המותג',
    officialBrandWebsite: 'אתר המותג הרשמי',
    
    // Categories
    fashion: 'אופנה',
    food: 'מזון',
    health: 'בריאות',
    finance: 'פיננסי',
    grocery: 'מזון',
    transport: 'תחבורה',
    entertainment: 'בידור',
    convenience: 'נוחות',
    baby: 'תינוקות',
    
    // Footer
    privacy: 'פרטיות',
    terms: 'תנאים',
    contact: 'צור קשר',
    
    // Static Text
    backToHome: 'חזרה לדף הבית',
    termsOfUse: 'תנאי שימוש',
    validOnlyOnBirthday: 'תקף ביום ההולדת בלבד',
    validForEntireMonth: 'תקף לכל החודש',
    validForWeek: 'תקף לשבוע',
    validForLimitedPeriod: 'תקף לתקופה מוגבלת',
    discountOnAllPurchases: '30% הנחה על כל הקנייה',
    specialBirthdayDiscount: 'הטבה מיוחדת ליום הולדת - 30% הנחה על כל הקנייה בחנות',
    return: 'חזרה',
    activeOutOfTotal: 'פעילים מתוך',
    technicalSupport: 'תמיכה טכנית',
    improvementSuggestion: 'הצעת שיפור',
    bugReport: 'דיווח על באג',
    generalQuestion: 'שאלה כללית',
    writeYourMessageHere: 'כתוב את הודעתך כאן...',
    enterYourFullName: 'הכנס את שמך המלא',
    yourEmail: 'your@email.com',
    contactInformation: 'פרטי קשר',
    subject: 'נושא',
    message: 'הודעה',
    workingHours: 'שעות פעילות',
    address: 'כתובת',
    phone: 'טלפון',
    chooseSubject: 'בחר נושא',
    reportIncorrectInfo: 'דווח על מידע שגוי או חסר',
    thankYouForReporting: 'תודה על הדיווח!',
    weWillCheckAndUpdate: 'נבדוק את המידע ונעדכן בהקדם.',
    newBenefitsAvailable: 'יש לך 5 הטבות חדשות זמינות לחודש יום ההולדת שלך',
    benefitExpiresInDays: 'הטבה של Fox מסתיימת בעוד 3 ימים',
    addedNewBenefit: 'Starbucks הוסיף הטבה חדשה ליום הולדת',
    newBenefitFrom: 'הטבה חדשה מ-Super-Pharm',
    hoursAgo: 'שעות לפני',
    daysAgo: 'ימים לפני',
    ago: 'לפני',
    
    // About Page
    about: 'אודות',
    aboutTitle: 'אודות YomU',
    aboutDescription: 'הפלטפורמה המובילה להטבות יום הולדת בישראל',
    mission: 'המשימה שלנו',
    missionDescription: 'לעזור לכם למצות את כל ההטבות ליום הולדת ולחסוך כסף',
    vision: 'החזון שלנו',
    visionDescription: 'להפוך את חודש יום ההולדת לחודש החסכון של השנה',
    team: 'הצוות',
    contributors: 'תורמים',
    contributorsDescription: 'האנשים שעומדים מאחורי YomU',
    
    // Team Members
    leadDeveloper: 'מפתח מוביל',
    uxDesigner: 'מעצב UX/UI',
    productManager: 'מנהל מוצר',
    contentContributors: 'תורמי תוכן',
    contentContributorsDescription: 'אנשים שתרמו מידע על הטבות יום הולדת',
    qualityAssurance: 'בודקי איכות',
    qualityAssuranceDescription: 'צוות הבודק את דיוק המידע',
    
    // Terms Page
    termsAcceptance: 'קבלת התנאים',
    termsAcceptanceDescription: 'השימוש באתר YomU מהווה הסכמה לתנאי השימוש הללו. אם אינכם מסכימים לתנאים, אנא אל תשתמשו בשירות.',
    serviceUsage: 'שימוש בשירות',
    serviceUsageDescription: 'השירות מיועד לשימוש אישי בלבד. אסור להשתמש בשירות למטרות מסחריות או להפיץ מידע ללא אישור.',
    liability: 'אחריות',
    liabilityDescription: 'אנו משתדלים לספק מידע מדויק, אך איננו אחראים לטעויות או למידע לא מעודכן. יש לוודא את פרטי ההטבות ישירות אצל הספקים.',
    termsChanges: 'שינויים בתנאים',
    termsChangesDescription: 'אנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. שינויים יובאו לידיעת המשתמשים.',
    accountCancellation: 'ביטול חשבון',
    accountCancellationDescription: 'ניתן לבטל את החשבון בכל עת דרך הגדרות החשבון. ביטול החשבון יביא למחיקת כל הנתונים הקשורים.',
    
    // Privacy Page
    dataCollection: 'איסוף מידע',
    dataCollectionDescription: 'אנו אוספים מידע בסיסי כגון שם, כתובת דוא"ל ותאריך לידה כדי לספק לכם את השירות הטוב ביותר. המידע שלכם נשמר בצורה מאובטחת ולא יועבר לצדדים שלישיים ללא הסכמתכם המפורשת.',
    security: 'אבטחה',
    securityDescription: 'אנו משתמשים בטכנולוגיות אבטחה מתקדמות כדי להגן על המידע שלכם. כל הנתונים מוצפנים ומועברים באמצעות חיבורים מאובטחים.',
    userRights: 'זכויות המשתמש',
    userRightsDescription: 'יש לכם הזכות לבקש גישה למידע שלכם, לעדכן אותו או למחוק אותו בכל עת. ניתן ליצור איתנו קשר דרך דף "צור קשר" באתר.',
    policyUpdates: 'עדכונים למדיניות',
    policyUpdatesDescription: 'מדיניות זו עשויה להתעדכן מעת לעת. שינויים משמעותיים יובאו לידיעתכם באמצעות הודעות באתר או בדוא"ל.',
    
    // Contact Page
    contactAddress: 'רחוב הרצל 123, תל אביב',
    contactPhone: '03-1234567',
    workingHoursValue: 'א\'-ה\' 9:00-18:00',
    sendMessage: 'שלח הודעה',
    
    // Signin page
    welcome: 'ברוכים הבאים',
    signInToYourAccount: 'התחברו לחשבון שלכם',
    invalidCredentials: 'פרטי התחברות שגויים',
    signInError: 'שגיאה בהתחברות',
    googleSignInError: 'שגיאה בהתחברות עם Google',
    saveEmail: 'שמור אימייל',
    keepMeSignedIn: 'השאר אותי מחובר',
    signingIn: 'מתחבר...',
    or: 'או',
    signUpNow: 'הירשמו עכשיו',
    signInWithGitHub: 'התחבר עם GitHub',
    githubSignInError: 'שגיאה בהתחברות עם GitHub',
    githubSignUpError: 'שגיאה בהרשמה דרך GitHub',
    signUpWithGitHub: 'הירשם עם GitHub',
    
    // Used Benefits
    markAsUsed: 'סמן כמשומש',
    unmarkAsUsed: 'בטל סימון כמשומש',
    usedBenefits: 'הטבות משומשות',
    usedBenefitsDescription: 'הטבות שסימנת כמשומשות',
    noUsedBenefits: 'אין הטבות משומשות',
    usedOn: 'שומש ב:',
    addNotes: 'הוסף הערות',
    notes: 'הערות',
    markBenefitAsUsed: 'סמן הטבה כמשומשת',
    unmarkBenefitAsUsed: 'בטל סימון הטבה כמשומשת',
    benefitUsedSuccessfully: 'הטבה סומנה כמשומשת בהצלחה',
    benefitUnmarkedSuccessfully: 'סימון הטבה כמשומשת בוטל בהצלחה',
    usedBenefitsHistory: 'היסטוריית הטבות משומשות',
    usedBenefitsHistoryDescription: 'צפה בכל ההטבות שסימנת כמשומשות',
    
    // API Key
    apiKey: 'מפתח API',
    apiKeyDescription: 'השתמש במפתח API זה לבדיקות ופיתוח. ברירת מחדל: key123',
    editApiKey: 'ערוך מפתח API',
    saveApiKey: 'שמור מפתח API',
    copyApiKey: 'העתק',
    apiKeyCopied: 'מפתח API הועתק',
    apiKeySaved: 'מפתח API נשמר',
    // API/Errors
    unauthorized: 'לא מורשה - אנא התחבר מחדש',
    internalServerError: 'שגיאה פנימית בשרת',
    missingFields: 'כל השדות נדרשים',
    userCreatedSuccessfully: 'משתמש נוצר בהצלחה',
    passwordTooShort: 'הסיסמה חייבת להיות לפחות 6 תווים',
    userAlreadyExists: 'משתמש עם כתובת אימייל זו כבר קיים',
    profileUpdatedSuccessfully: 'הפרופיל עודכן בהצלחה',
    profileUpdateError: 'שגיאה בעדכון הפרופיל',
    profileLoadError: 'שגיאה בטעינת הפרופיל',
    userNotFound: 'משתמש לא נמצא',
    customMembershipNotFound: 'חברות מותאמת אישית לא נמצאה',
    customMembershipCreated: 'הטבה נוספה בהצלחה',
    customMembershipUpdated: 'חברות מותאמת אישית עודכנה בהצלחה',
    customMembershipDeleted: 'חברות מותאמת אישית נמחקה בהצלחה',
    customMembershipIdRequired: 'מזהה חברות מותאמת אישית נדרש',
    benefitNotFound: 'הטבה לא נמצאה',
    // Benefit detail page
    description: 'תיאור',
    benefitLoadError: 'שגיאה בטעינת ההטבה',
    benefitNotFoundDescription: 'ההטבה שביקשת לא קיימת או הוסרה.',
    backToDashboard: 'חזור לדשבורד',
    copyCouponCode: 'העתק קוד קופון',
    copiedToClipboard: '✓ הועתק ללוח',
    buyNowTitle: 'לחץ לקנייה ישירה באתר המותג',
    visitWebsiteTitle: 'לחץ לביקור באתר הרשמי של המותג',
    databaseSeedSuccess: 'הנתונים נזרעו בהצלחה',
    databaseSeedError: 'שגיאה בזריעת הנתונים',
    prismaConnectionSuccess: 'Prisma התחבר בהצלחה',
    prismaConnectionFailed: 'Prisma נכשל בהתחברות',
    failedToFetchUsers: 'נכשל באחזור משתמשים',
    benefitUnmarked: 'סימון הטבה הוסר',
    
    // (duplicate team/terms/privacy/contact blocks removed; earlier canonical values kept above)
    
    // Membership Types
    free: 'חינמי',
    paid: 'בתשלום',
    membershipType: 'סוג חברות',
    membershipCost: 'עלות חברות',
    costDetails: 'פרטי עלות',
    
    // Search and Filter
    search: 'חיפוש',
    
    filterBy: 'סנן לפי',
    allCategories: 'כל הקטגוריות',
    searchPlaceholder: 'חפש הטבות...',
    
    validityPeriod: 'תקופה חוקית',
    allPeriods: 'כל התקופות',
    
    quickFilters: 'סינון מהיר',
    
    // Multi-brand Partnerships
    includesAccessTo: 'כולל גישה ל',
    additionalBrands: 'מותגים נוספים',
    showBrandList: 'הצג רשימת מותגים',
    partnerships: 'שותפויות',
    partners: 'שותפים',
    partnerBrands: 'מותגים שותפים',
    
    // New Services
    escapeRoom: 'אסקייפרום',
    escapeRoomBenefit: '50 שח הנחה בחודש יום הולדת',
    bacaroRestaurant: 'מסעדת באקרו (רעננה)',
    bacaroBenefit: 'מנה ראשונה וקינוח מתנה',
    shegevRestaurant: 'שגב (מסעדה)',
    shegevBenefit: 'מנה ראשונה',
    jamesBeer: 'ג\'מס',
    jamesBenefit: 'חצי ליטר בירה',
    pragRestaurant: 'פראג הקטנה (מסעדה)',
    pragBenefit: '50 נק\' מתנה',
    mikaConvenience: 'מיקה חנויות נוחות',
    mikaBenefit: '10 שח מתנה בהצגת תעודה',
    kfcBenefit: 'המבורגר 1+1',
    manamDIY: 'מנמ עשה זאת בעצמך',
    manamBenefit: '50 שח מתנה (מעל 300)',
    shilav: 'שילב',
    shilavBenefit: 'הטבות מיוחדות',
    youmangus: 'יומנגס',
    youmangusBenefit: 'הטבות ייחודיות',
    m32Burgers: 'M32 המבורגרים',
    m32BurgersBenefit: '15% הנחה בחודש יום הולדת',
    libiraRestaurant: 'מסעדת ליבירה',
    libiraRestaurantBenefit: 'בירה וקינוח בישיבה בלבד כל החודש',
    
    // Onboarding page
    onboardingTitle: 'איזה תוכניות חברות יש לכם?',
    onboardingDescription: 'בחרו את כל תוכניות החברות שלכם כדי שנוכל להציג לכם את כל ההטבות ליום הולדת',
    onboardingSelectAtLeastOne: 'אנא בחרו לפחות תוכנית אחת',
    onboardingSaveError: 'שגיאה בשמירת החברויות',
    onboardingContinueToDashboard: 'המשך לדשבורד',
    onboardingSkipForNow: 'דלג לעת עתה',
    onboardingSelectedCount: 'נבחרו {count} תוכניות',
    onboardingSaving: 'שומר...',
    
    // Brand descriptions
    brandDescriptionFashion: 'הטבות על ביגוד והנעלה',
    brandDescriptionHealth: 'הטבות על מוצרי בריאות ויופי',
    brandDescriptionFood: 'הטבות על מזון מהיר',
    brandDescriptionHome: 'הטבות על מוצרי בית',
    brandDescriptionFinance: 'הטבות על שירותים פיננסיים',
    brandDescriptionCoffee: 'הטבות על קפה ומשקאות',
    brandDescriptionGrocery: 'הטבות על מוצרי מזון',
    
    // Dashboard categories
    categoryFashion: 'אופנה',
    categoryFood: 'מזון',
    categoryHealth: 'בריאות',
    categoryHome: 'בית',
    categoryFinance: 'פיננסי',
    categoryGrocery: 'מזון',
    categoryEntertainment: 'בידור',
    categoryConvenience: 'נוחות',
    categoryTransport: 'תחבורה',
    categoryBaby: 'תינוקות',
    
    // Validity durations
    validityExactDate: 'יום אחד',
    validityEntireMonth: 'חודש שלם',
    validityWeekBeforeAfter: 'שבועיים',
    validityWeekend: 'סוף שבוע',
    validity30Days: '30 ימים',
    validity7DaysBefore: '7 ימים לפני',
    validity7DaysAfter: '7 ימים אחרי',
    validity3DaysBefore: '3 ימים לפני',
    validity3DaysAfter: '3 ימים אחרי',
    validityLimitedPeriod: 'תקופה מוגבלת',
    
    // Language abbreviations
    languageAbbreviationHebrew: 'עב',
    languageAbbreviationEnglish: 'EN',
    
    // Page titles
    pageTitle: 'YomU - יום-You | Birthday Benefits',
    
    // Dashboard UI elements
    user: 'משתמש',
    personalProfile: 'פרופיל אישי',
    appearanceAndLanguage: 'מראה ושפה',
    account: 'חשבון',
    accountManagement: 'ניהול חשבון',
    helloUser: 'שלום {name}! 🎉',
    hereAreYourBirthdayBenefits: 'הנה ההטבות שלך ליום הולדת',
    
    // Signup page
    passwordsDoNotMatch: 'הסיסמאות לא תואמות',
    passwordMinLength: 'הסיסמה חייבת להיות לפחות 8 תווים',
    registrationError: 'שגיאה בהרשמה',
    autoLoginError: 'שגיאה בהתחברות אוטומטית',
    googleRegistrationError: 'שגיאה בהרשמה דרך Google',
    
    // Dashboard filtering
    searchAndFilter: 'חיפוש וסינון',
    showFilters: 'הצג סינונים',
    hideFilters: 'הסתר סינונים',
    category: 'קטגוריה',
    
    
    // Dashboard additional UI
    allTypes: 'כל הסוגים',
    categoryLabel: 'קטגוריה',
    periodLabel: 'תקופה',
    typeLabel: 'סוג',
    buyNow: 'קנה עכשיו',
    quickActions: 'פעולות',
    
    // Notifications
    birthdayMonthStarted: 'חודש יום הולדת התחיל! 🎉',
    birthdayMonthStartedMessage: 'חודש יום הולדת התחיל! 🎉',
    benefitExpiringSoon: 'הטבה מסתיימת בקרוב',
    benefitExpiringMessage: 'הטבה מסתיימת בקרוב',
    newBenefitAvailable: 'הטבה חדשה זמינה',
  },
  en: {
    // Navigation
    home: 'Home',
    
    dashboard: 'Dashboard',
    memberships: 'Memberships',
    profile: 'Profile',
    
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    back: 'Back',
    settings: 'Settings',
    logout: 'Logout',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    copy: 'Copy',
    copied: 'Copied',
    moreDetails: 'More Details',
    loading: 'Loading...',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    unsavedChangesWarning: 'You have unsaved changes. If you leave now, your changes will be lost. Are you sure you want to leave?',
    
    // Landing Page
    appName: 'YomU',
    appTagline: 'Birthday Benefits in One Place',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    allRightsReserved: 'All Rights Reserved',
    heroTitle: 'Never Miss a Birthday Deal Again',
    heroDescription: 'We centralize all birthday benefits, deals, and gifts in one place. Track all your programs and receive real-time notifications.',
    feature1Title: 'Centralized Benefits',
    feature1Description: 'All birthday benefits from all your programs in one place',
    feature2Title: 'Smart Notifications',
    feature2Description: 'Receive real-time notifications about new benefits and reminders',
    feature3Title: 'Time Saving',
    feature3Description: 'Save time and money - never miss a birthday deal',
    statsBrands: 'Brands',
    statsBenefits: 'Benefits',
    statsUsers: 'Users',
    statsSaved: 'Saved',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password',
    signInWithGoogle: 'Sign In with Google',
    signUpWithGoogle: 'Sign Up with Google',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create Account',
    
    // Onboarding
    welcomeTitle: 'Welcome to YomU!',
    welcomeSubtitle: 'Select your memberships to get started',
    selectMemberships: 'Select Memberships',
    selectMembershipsDescription: 'Select all your membership programs so we can show you all birthday benefits',
    continue: 'Continue',
    
    // Dashboard
    myBenefits: 'My Benefits',
    activeNow: 'Active Now',
    comingSoon: 'Coming Soon',
    noActiveBenefits: 'No active benefits right now',
    noUpcomingBenefits: 'No upcoming benefits',
    couponCode: 'Coupon Code:',
    validUntil: 'Valid Until:',
    expiresIn: 'Expires In:',
    
    // Memberships
    manageMemberships: 'Manage Memberships',
    membershipsDescription: 'Select all your membership programs so we can show you all birthday benefits',
    activeMemberships: 'Active Memberships',
    totalMemberships: 'Total Memberships',
    selectedPrograms: 'Selected Programs',
    moreProgramsMoreBenefits: 'The more programs you select, the more birthday benefits you\'ll get',
    addCustomMembership: 'Add Custom Membership',
    customMembershipName: 'Membership Name',
    customMembershipDescription: 'Description',
    customMembershipCategory: 'Category',
    selectAllMemberships: 'Select all memberships',
    programsSelected: 'Programs selected',
    addMembership: 'Add membership',
    changesSavedSuccessfully: 'Changes saved successfully',
    chooseCategory: 'Choose category',
    
    // Profile
    profileSettings: 'Profile Settings',
    personalInformation: 'Personal Information',
    notificationSettings: 'Notification Settings',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    phoneNumber: 'Phone Number',
    emailNotifications: 'Email Notifications',
    emailNotificationsDescription: 'Receive notifications about new benefits and birthday reminders to your email address',
    pushNotifications: 'Push Notifications',
    pushNotificationsDescription: 'Receive instant notifications about new benefits and birthday reminders on your device',
    smsNotifications: 'SMS Notifications',
    smsNotificationsDescription: 'Receive SMS messages about new benefits and birthday reminders to your phone number',
    fullName: 'Full Name',
    anniversaryDate: 'Anniversary Date',
    optional: 'Optional',
    profilePicture: 'Profile Picture',
    clickToChange: 'Click to change',
    editProfile: 'Edit Profile',
    emailPermanent: 'Email address is permanent and cannot be changed',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    darkModeDescription: 'Change the appearance of the app',
    language: 'Language',
    interfaceLanguage: 'Interface Language',
    languageDescription: 'Choose your preferred language',
    fullySupported: 'Fully Supported',
    betaLanguages: 'Beta Languages',
    betaLanguagesNote: 'Beta languages may be partially translated',
    account: 'Account',
    
    // Notifications
    notifications: 'Notifications',
    notificationsTitle: 'Notifications',
    markAsRead: 'Mark as Read',
    markAllAsRead: 'Mark All as Read',
    noNotifications: 'No notifications',
    newNotificationsCount: '{count} new notifications',
    noNewNotifications: 'No new notifications',
    newBenefit: 'New Benefit',
    benefitExpiring: 'Benefit Expiring',
    birthdayMonthStart: 'Birthday Month Started',
    
    // Benefit Details
    benefitDetails: 'Benefit Details',
    termsAndConditions: 'Terms & Conditions',
    howToRedeem: 'How to Redeem',
    visitWebsite: 'Visit Website',
    buyOnBrandWebsite: 'Buy on brand website',
    officialBrandWebsite: 'Official brand website',
    
    // Categories
    fashion: 'Fashion',
    food: 'Food',
    health: 'Health',
    homeCategory: 'Home',
    finance: 'Finance',
    grocery: 'Grocery',
    transport: 'Transport',
    entertainment: 'Entertainment',
    convenience: 'Convenience',
    baby: 'Baby',
    
    // Footer
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    
    // Static Text
    backToHome: 'Back to Home',
    termsOfUse: 'Terms of Use',
    validOnlyOnBirthday: 'Valid only on birthday',
    validForEntireMonth: 'Valid for entire month',
    validForWeek: 'Valid for week',
    validForLimitedPeriod: 'Valid for limited period',
    discountOnAllPurchases: '30% discount on all purchases',
    specialBirthdayDiscount: 'Special birthday discount - 30% discount on all purchases in store',
    return: 'Return',
    activeOutOfTotal: 'active out of',
    newBenefitsAvailable: 'You have 5 new benefits available for your birthday month',
    benefitExpiresInDays: 'Fox benefit expires in 3 days',
    addedNewBenefit: 'Starbucks added a new birthday benefit',
    newBenefitFrom: 'New benefit from Super-Pharm',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    ago: 'ago',
    technicalSupport: 'Technical support',
    improvementSuggestion: 'Improvement suggestion',
    bugReport: 'Bug report',
    generalQuestion: 'General question',
    writeYourMessageHere: 'Write your message here...',
    enterYourFullName: 'Enter your full name',
    yourEmail: 'your@email.com',
    reportIncorrectInfo: 'Report incorrect or missing information',
    thankYouForReporting: 'Thank you for reporting!',
    weWillCheckAndUpdate: 'We will check the information and update soon.',
    
    // About Page
    about: 'About',
    aboutTitle: 'About YomU',
    aboutDescription: 'The leading platform for birthday benefits in Israel',
    mission: 'Our Mission',
    missionDescription: 'To help you maximize all birthday benefits and save money',
    vision: 'Our Vision',
    visionDescription: 'To make your birthday month the savings month of the year',
    team: 'Team',
    contributors: 'Contributors',
    contributorsDescription: 'The people behind YomU',
    
    // Team Members
    leadDeveloper: 'Lead Developer',
    uxDesigner: 'UX Designer',
    productManager: 'Product Manager',
    contentContributors: 'Content Contributors',
    contentContributorsDescription: 'People who contributed information about birthday benefits',
    qualityAssurance: 'Quality Assurance',
    qualityAssuranceDescription: 'Team that verifies the accuracy of information',
    
    // Terms Page
    termsAcceptance: 'Terms Acceptance',
    termsAcceptanceDescription: 'Using the YomU website constitutes agreement to these terms of use. If you do not agree to the terms, please do not use the service.',
    serviceUsage: 'Service Usage',
    serviceUsageDescription: 'The service is intended for personal use only. It is not permitted to use the service for commercial purposes or to distribute information without permission.',
    liability: 'Liability',
    liabilityDescription: 'We strive to provide accurate information, but we are not responsible for errors or outdated information. Please verify benefit details directly with providers.',
    termsChanges: 'Changes to Terms',
    termsChangesDescription: 'We reserve the right to change these terms at any time. Changes will be brought to users\' attention.',
    accountCancellation: 'Account Cancellation',
    accountCancellationDescription: 'You can cancel your account at any time through account settings. Canceling your account will result in deletion of all related data.',
    
    // Privacy Page
    dataCollection: 'Data Collection',
    dataCollectionDescription: 'We collect basic information such as name, email address, and date of birth to provide you with the best service. Your information is stored securely and will not be shared with third parties without your explicit consent.',
    security: 'Security',
    securityDescription: 'We use advanced security technologies to protect your information. All data is encrypted and transmitted through secure connections.',
    userRights: 'User Rights',
    userRightsDescription: 'You have the right to request access to your information, update it, or delete it at any time. You can contact us through the "Contact Us" page on the website.',
    policyUpdates: 'Policy Updates',
    policyUpdatesDescription: 'This policy may be updated from time to time. Significant changes will be brought to your attention through website notifications or email.',
    
    // Contact Page
    contactAddress: 'Herzl Street 123, Tel Aviv',
    contactPhone: '03-1234567',
    workingHoursValue: 'Sun-Thu 9:00-18:00',
    sendMessage: 'Send Message',
    contactInformation: 'Contact information',
    subject: 'Subject',
    message: 'Message',
    workingHours: 'Working hours',
    address: 'Address',
    phone: 'Phone',
    chooseSubject: 'Choose subject',
    
    // Membership Types
    free: 'Free',
    paid: 'Paid',
    membershipType: 'Membership Type',
    membershipCost: 'Membership Cost',
    costDetails: 'Cost Details',
    
    // Search and Filter
    search: 'Search',
    searchPlaceholder: 'Search memberships...',
    filterBy: 'Filter by',
    allCategories: 'All Categories',
    quickFilters: 'Quick Filters',
    
    // Multi-brand Partnerships
    includesAccessTo: 'includes access to',
    additionalBrands: 'additional brands',
    showBrandList: 'show brand list',
    partnerships: 'partnerships',
    partners: 'partners',
    partnerBrands: 'partner brands',
    
    // New Services
    escapeRoom: 'Escape Room',
    escapeRoomBenefit: '50 NIS discount in birthday month',
    bacaroRestaurant: 'Bacaro Restaurant (Raanana)',
    bacaroBenefit: 'Free appetizer and dessert',
    shegevRestaurant: 'Shegev (Restaurant)',
    shegevBenefit: 'Free appetizer',
    jamesBeer: 'James',
    jamesBenefit: 'Half liter beer',
    pragRestaurant: 'Little Prague (Restaurant)',
    pragBenefit: '50 points bonus',
    mikaConvenience: 'Mika Convenience Stores',
    mikaBenefit: '10 NIS bonus with ID',
    kfcBenefit: '1+1 Burger',
    manamDIY: 'Manam DIY',
    manamBenefit: '50 NIS bonus (over 300)',
    shilav: 'Shilav',
    shilavBenefit: 'Special benefits',
    youmangus: 'Youmangus',
    youmangusBenefit: 'Unique benefits',
    m32Burgers: 'M32 Burgers',
    m32BurgersBenefit: '15% discount in birthday month',
    libiraRestaurant: 'Libira Restaurant',
    libiraRestaurantBenefit: 'Beer and dessert for dine-in only all month',
    
    // Onboarding page
    onboardingTitle: 'Which membership programs do you have?',
    onboardingDescription: 'Select all your membership programs so we can show you all birthday benefits',
    onboardingSelectAtLeastOne: 'Please select at least one program',
    onboardingSaveError: 'Error saving memberships',
    onboardingContinueToDashboard: 'Continue to Dashboard',
    onboardingSkipForNow: 'Skip for now',
    onboardingSelectedCount: '{count} programs selected',
    onboardingSaving: 'Saving...',
    
    // Brand descriptions
    brandDescriptionFashion: 'Benefits on clothing and footwear',
    brandDescriptionHealth: 'Benefits on health and beauty products',
    brandDescriptionFood: 'Benefits on fast food',
    brandDescriptionHome: 'Benefits on home products',
    brandDescriptionFinance: 'Benefits on financial services',
    brandDescriptionCoffee: 'Benefits on coffee and beverages',
    brandDescriptionGrocery: 'Benefits on food products',
    
    // Dashboard categories
    categoryFashion: 'Fashion',
    categoryFood: 'Food',
    categoryHealth: 'Health',
    categoryHome: 'Home',
    categoryFinance: 'Finance',
    categoryGrocery: 'Grocery',
    categoryEntertainment: 'Entertainment',
    categoryConvenience: 'Convenience',
    categoryTransport: 'Transport',
    categoryBaby: 'Baby',
    
    // Validity durations
    validityExactDate: 'One day',
    validityEntireMonth: 'Entire month',
    validityWeekBeforeAfter: 'Two weeks',
    validityWeekend: 'Weekend',
    validity30Days: '30 days',
    validity7DaysBefore: '7 days before',
    validity7DaysAfter: '7 days after',
    validity3DaysBefore: '3 days before',
    validity3DaysAfter: '3 days after',
    validityLimitedPeriod: 'Limited period',
    
    // Language abbreviations
    languageAbbreviationHebrew: 'עב',
    languageAbbreviationEnglish: 'EN',
    
    // Page titles
    pageTitle: 'YomU - יום-You | Birthday Benefits',
    
    // Dashboard UI elements
    user: 'User',
    personalProfile: 'Personal Profile',
    appearanceAndLanguage: 'Appearance & Language',
    accountManagement: 'Account Management',
    helloUser: 'Hello {name}! 🎉',
    hereAreYourBirthdayBenefits: 'Here are your birthday benefits',
    
    // Signup page
    passwordsDoNotMatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 8 characters',
    registrationError: 'Registration error',
    autoLoginError: 'Auto-login error',
    googleRegistrationError: 'Google registration error',
    
    // Dashboard filtering
    searchAndFilter: 'Search & Filter',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    category: 'Category',
    validityPeriod: 'Validity period',
    allPeriods: 'All periods',
    
    // Dashboard additional UI
    allTypes: 'All Types',
    categoryLabel: 'Category',
    periodLabel: 'Period',
    typeLabel: 'Type',
    buyNow: 'Buy now',
    quickActions: 'Actions',
    
    // Notifications
    birthdayMonthStarted: 'Birthday month started! 🎉',
    birthdayMonthStartedMessage: 'You have 5 new benefits available for your birthday month',
    benefitExpiringSoon: 'Benefit expiring soon',
    benefitExpiringMessage: 'Fox benefit expires in 3 days',
    newBenefitAvailable: 'New benefit available',
    
    // Signin page
    welcome: 'Welcome',
    signInToYourAccount: 'Sign in to your account',
    invalidCredentials: 'Invalid credentials',
    signInError: 'Sign in error',
    googleSignInError: 'Google sign in error',
    saveEmail: 'Save email',
    keepMeSignedIn: 'Keep me signed in',
    signingIn: 'Signing in...',
    or: 'or',
    signUpNow: 'Sign up now',
    signInWithGitHub: 'Sign in with GitHub',
    githubSignInError: 'GitHub sign in error',
    githubSignUpError: 'GitHub registration error',
    signUpWithGitHub: 'Sign up with GitHub',
    
    // Used Benefits
    markAsUsed: 'Mark as Used',
    unmarkAsUsed: 'Unmark as Used',
    usedBenefits: 'Used Benefits',
    usedBenefitsDescription: 'Benefits you have marked as used',
    noUsedBenefits: 'No used benefits',
    usedOn: 'Used on:',
    addNotes: 'Add notes',
    notes: 'Notes',
    markBenefitAsUsed: 'Mark benefit as used',
    unmarkBenefitAsUsed: 'Unmark benefit as used',
    benefitUsedSuccessfully: 'Benefit marked as used successfully',
    benefitUnmarkedSuccessfully: 'Benefit unmarked successfully',
    usedBenefitsHistory: 'Used Benefits History',
    usedBenefitsHistoryDescription: 'View all benefits you have marked as used',
    
    // API Key
    apiKey: 'API Key',
    apiKeyDescription: 'Use this API key for testing and development purposes. Default: key123',
    editApiKey: 'Edit API Key',
    saveApiKey: 'Save API Key',
    copyApiKey: 'Copy',
    apiKeyCopied: 'API key copied',
    apiKeySaved: 'API key saved',
    // API/Errors
    unauthorized: 'Unauthorized - please sign in again',
    internalServerError: 'Internal server error',
    missingFields: 'All fields are required',
    userCreatedSuccessfully: 'User created successfully',
    passwordTooShort: 'Password must be at least 6 characters',
    userAlreadyExists: 'A user with this email already exists',
    profileUpdatedSuccessfully: 'Profile updated successfully',
    profileUpdateError: 'Error updating profile',
    profileLoadError: 'Error loading profile',
    userNotFound: 'User not found',
    customMembershipNotFound: 'Custom membership not found',
    customMembershipCreated: 'Custom membership created successfully',
    customMembershipUpdated: 'Custom membership updated successfully',
    customMembershipDeleted: 'Custom membership deleted successfully',
    customMembershipIdRequired: 'Custom membership ID is required',
    benefitNotFound: 'Benefit not found',
    // Benefit detail page
    description: 'Description',
    benefitLoadError: 'Error loading benefit',
    benefitNotFoundDescription: 'The benefit you requested does not exist or was removed.',
    backToDashboard: 'Back to dashboard',
    copyCouponCode: 'Copy coupon code',
    copiedToClipboard: '✓ Copied to clipboard',
    buyNowTitle: 'Click to buy directly on the brand website',
    visitWebsiteTitle: 'Click to visit the brand’s official website',
    databaseSeedSuccess: 'Database seeded successfully',
    databaseSeedError: 'Error seeding database',
    prismaConnectionSuccess: 'Prisma connection successful',
    prismaConnectionFailed: 'Prisma connection failed',
    failedToFetchUsers: 'Failed to fetch users',
    benefitUnmarked: 'Benefit unmarked as used',
  },
}; 