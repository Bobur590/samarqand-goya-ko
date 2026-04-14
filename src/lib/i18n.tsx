import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "uz" | "ru";

const translations = {
  uz: {
    // Nav
    home: "Bosh sahifa",
    howItWorks: "Qanday ishlaydi",
    login: "Kirish",
    logout: "Chiqish",
    adminPanel: "Admin Panel",
    submitIdea: "G'oya yuborish",
    userDashboard: "Mening panelim",
    adminDashboard: "Admin panel",
    language: "Til",

    // Login
    loginTitle: "Tizimga kirish",
    username: "Login",
    password: "Parol",
    loginButton: "Kirish",
    loggingIn: "Kirilmoqda...",
    loginError: "Login yoki parol noto'g'ri",
    loginErrorGeneric: "Xatolik yuz berdi",

    // User dashboard
    userDashboardTitle: "Startup g'oyangizni yuboring",
    userDashboardDesc: "Barcha maydonlarni to'ldiring. AI tizim g'oyangizni baholaydi.",
    startupName: "Startup nomi",
    category: "Kategoriya",
    selectCategory: "Tanlang",
    problemLabel: "Muammo tavsifi",
    problemPlaceholder: "Qanday muammoni hal qilasiz?",
    solutionLabel: "Yechimingiz",
    solutionPlaceholder: "Muammoni qanday hal qilasiz?",
    budget: "Kerakli byudjet (so'm)",
    budgetPlaceholder: "Masalan: 50,000,000",
    contactInfo: "Aloqa ma'lumotlari",
    fullName: "Ismingiz",
    phone: "Telefon raqam",
    email: "Email (ixtiyoriy)",
    submit: "G'oyani yuborish",
    submitting: "AI baholash jarayonida...",
    submitSuccess: "G'oyangiz qabul qilindi!",
    submitSuccessDesc: "AI tizim g'oyangizni baholaydi va natijani tez orada ko'rasiz.",
    submitAnother: "Yana g'oya yuborish",
    fillRequired: "Barcha majburiy maydonlarni to'ldiring",
    submitError: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
    ideaSubmitted: "G'oyangiz muvaffaqiyatli yuborildi!",
    aboutIdea: "G'oya haqida",

    // Admin
    adminTitle: "Admin Panel",
    adminDesc: "Barcha startup g'oyalarini ko'ring va boshqaring",
    search: "Qidirish...",
    allCategories: "Barcha kategoriyalar",
    allStatuses: "Barchasi",
    pending: "Kutilmoqda",
    scored: "Baholangan",
    top: "TOP",
    rejected: "Rad etilgan",
    total: "Jami",
    ideas: "ta g'oya",
    loading: "Yuklanmoqda...",
    noIdeas: "Hali g'oyalar yo'q",
    checking: "Tekshirilmoqda...",

    // Home
    heroTag: "Samarqand shahri innovatsion platformasi",
    heroTitle1: "G'oyangiz bor?",
    heroTitle2: "Platformaga yuboring.",
    heroDesc: "G'oyangizni yuboring. Platforma AI yordamida baholaydi, saralaydi va faqat eng yaxshilarini hokimiyatga chiqaradi.",
    heroSubmit: "G'oya yuborish",
    heroHow: "Qanday ishlaydi?",
    step1Title: "G'oya yuboring",
    step1Desc: "Startup g'oyangizni forma orqali tasvirlab bering",
    step2Title: "AI baholaydi",
    step2Desc: "Sun'iy intellekt 6 ta kriteriya bo'yicha ball beradi",
    step3Title: "Saralanadi",
    step3Desc: "G'oyalar score bo'yicha avtomatik saralanadi",
    step4Title: "TOP chiqadi",
    step4Desc: "85+ ball olgan g'oyalar hokimiyatga ko'rinadi",
    stat1: "Shaffof baholash",
    stat2: "Avtomatik scoring",
    stat3: "Baholash kriteriyasi",

    // Footer
    footerDesc: "Samarqand shahri hokimligi innovatsion g'oyalar platformasi.",
    footerRights: "© 2026 Startup → Hokim. Barcha huquqlar himoyalangan.",

    // Admin sidebar
    allStartups: "Barcha g'oyalar",
    topStartups: "TOP loyihalar",
    statistics: "Statistika",
  },
  ru: {
    home: "Главная",
    howItWorks: "Как работает",
    login: "Войти",
    logout: "Выйти",
    adminPanel: "Админ панель",
    submitIdea: "Подать идею",
    userDashboard: "Мой кабинет",
    adminDashboard: "Админ панель",
    language: "Язык",

    loginTitle: "Вход в систему",
    username: "Логин",
    password: "Пароль",
    loginButton: "Войти",
    loggingIn: "Вход...",
    loginError: "Логин или пароль неверный",
    loginErrorGeneric: "Произошла ошибка",

    userDashboardTitle: "Подайте свою стартап-идею",
    userDashboardDesc: "Заполните все поля. AI система оценит вашу идею.",
    startupName: "Название стартапа",
    category: "Категория",
    selectCategory: "Выберите",
    problemLabel: "Описание проблемы",
    problemPlaceholder: "Какую проблему вы решаете?",
    solutionLabel: "Ваше решение",
    solutionPlaceholder: "Как вы решаете проблему?",
    budget: "Необходимый бюджет (сум)",
    budgetPlaceholder: "Например: 50,000,000",
    contactInfo: "Контактная информация",
    fullName: "Ваше имя",
    phone: "Номер телефона",
    email: "Email (необязательно)",
    submit: "Отправить идею",
    submitting: "AI оценивает...",
    submitSuccess: "Ваша идея принята!",
    submitSuccessDesc: "AI система оценит вашу идею и вы скоро увидите результат.",
    submitAnother: "Подать ещё идею",
    fillRequired: "Заполните все обязательные поля",
    submitError: "Произошла ошибка. Попробуйте ещё раз.",
    ideaSubmitted: "Ваша идея успешно отправлена!",
    aboutIdea: "Об идее",

    adminTitle: "Админ панель",
    adminDesc: "Просматривайте и управляйте стартап-идеями",
    search: "Поиск...",
    allCategories: "Все категории",
    allStatuses: "Все",
    pending: "Ожидает",
    scored: "Оценено",
    top: "ТОП",
    rejected: "Отклонено",
    total: "Всего",
    ideas: "идей",
    loading: "Загрузка...",
    noIdeas: "Пока нет идей",
    checking: "Проверка...",

    heroTag: "Инновационная платформа города Самарканд",
    heroTitle1: "Есть идея?",
    heroTitle2: "Отправьте на платформу.",
    heroDesc: "Отправьте свою идею. Платформа оценит её с помощью AI, отберёт лучшие и представит руководству.",
    heroSubmit: "Подать идею",
    heroHow: "Как работает?",
    step1Title: "Подайте идею",
    step1Desc: "Опишите свою стартап-идею через форму",
    step2Title: "AI оценивает",
    step2Desc: "ИИ выставляет баллы по 6 критериям",
    step3Title: "Отбор",
    step3Desc: "Идеи автоматически сортируются по баллам",
    step4Title: "Попадает в ТОП",
    step4Desc: "Идеи с 85+ баллами видны руководству",
    stat1: "Прозрачная оценка",
    stat2: "Автоматический скоринг",
    stat3: "Критериев оценки",

    footerDesc: "Инновационная платформа хокимията города Самарканд.",
    footerRights: "© 2026 Startup → Hokim. Все права защищены.",

    allStartups: "Все идеи",
    topStartups: "ТОП проекты",
    statistics: "Статистика",
  },
} as const;

type Translations = (typeof translations)[Lang];

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "uz",
  setLang: () => {},
  t: translations.uz as Translations,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("uz");

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
