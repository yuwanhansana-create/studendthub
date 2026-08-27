import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'si' | 'ta';

interface TranslationMap {
  [key: string]: {
    en: string;
    si: string;
    ta: string;
  };
}

export const TRANSLATIONS: TranslationMap = {
  // Brand
  brandTagline: {
    en: 'Connect. Learn. Grow.',
    si: 'සම්බන්ධ වන්න. ඉගෙන ගන්න. දියුණු වන්න.',
    ta: 'இணையுங்கள். கற்புங்கள். வளருங்கள்.'
  },
  heroTitle: {
    en: 'Your Student Community, Built for Sri Lanka.',
    si: 'ශ්‍රී ලාංකීය සිසු පරපුර උදෙසාම නිර්මාණය වූ අධ්‍යාපන ජාලය.',
    ta: 'இலங்கை மாணவர்களுக்காக உருவாக்கப்பட்ட பிரத்யேக கல்வி தளம்.'
  },
  heroSub: {
    en: 'Connect with students, discover education opportunities, stay informed, and learn smarter with StudentHub AI.',
    si: 'දිවයිනේ සිසුන් සමඟ එක්වන්න, අධ්‍යාපන අවස්ථා සොයාගන්න, සහ StudentHub AI සමඟින් පහසුවෙන් ඉගෙන ගන්න.',
    ta: 'மாணவர்களுடன் இணையுங்கள், கல்வி வாய்ப்புகளை அறிந்துகொள்ளுங்கள், StudentHub AI உடன் திறம்பட கற்புங்கள்.'
  },
  joinBtn: {
    en: 'Join StudentHub.lk',
    si: 'StudentHub.lk වෙත එක්වන්න',
    ta: 'StudentHub.lk இல் இணையுங்கள்'
  },
  exploreEducation: {
    en: 'Explore Education',
    si: 'අධ්‍යාපන තොරතුරු බලන්න',
    ta: 'கல்வியை ஆராயுங்கள்'
  },
  signIn: {
    en: 'Sign In',
    si: 'ඇතුල් වන්න',
    ta: 'உள்நுழைக'
  },
  signUp: {
    en: 'Register as Student',
    si: 'ලියාපදිංචි වන්න',
    ta: 'பதிவு செய்க'
  },
  signOut: {
    en: 'Sign Out',
    si: 'ඉවත් වන්න',
    ta: 'வெளியேறுக'
  },
  // Navigation
  navFeed: {
    en: 'Student Feed',
    si: 'ප්‍රජා පුවරුව',
    ta: 'மாணவர் தளம்'
  },
  navFindStudents: {
    en: 'Find Students',
    si: 'සිසුන් සොයන්න',
    ta: 'மாணவர்களை தேடுக'
  },
  navNews: {
    en: 'Education News',
    si: 'අධ්‍යාපන පුවත්',
    ta: 'கல்வி செய்திகள்'
  },
  navAi: {
    en: 'StudentHub AI',
    si: 'StudentHub AI සහකාර',
    ta: 'StudentHub AI உதவியாளர்'
  },
  navFriends: {
    en: 'My Friends',
    si: 'මගේ මිතුරන්',
    ta: 'எனது நண்பர்கள்'
  },
  navMessages: {
    en: 'Messages',
    si: 'පණිවිඩ',
    ta: 'செய்திகள்'
  },
  navNotifications: {
    en: 'Notifications',
    si: 'දැනුම්දීම්',
    ta: 'அறிவிப்புகள்'
  },
  navSettings: {
    en: 'Settings & Privacy',
    si: 'සැකසුම් සහ පෞද්ගලිකත්වය',
    ta: 'அமைப்புகள் & தனியுரிமை'
  },
  navAdmin: {
    en: 'Admin Directorate',
    si: 'පරිපාලන පාලකය',
    ta: 'நிர்வாக தளம்'
  },
  // Search & Student ID
  studentIdBadge: {
    en: 'Student ID',
    si: 'ශිෂ්‍ය අංකය',
    ta: 'மாணவர் இலக்கம்'
  },
  searchPlaceholder: {
    en: 'Search by Student ID (e.g. STU-7A42K9), name, or school...',
    si: 'ශිෂ්‍ය අංකය (උදා: STU-7A42K9), නම හෝ පාසල මගින් සොයන්න...',
    ta: 'மாணவர் இலக்கம் (உதா: STU-7A42K9), பெயர் அல்லது பாடசாலை மூலம் தேடுக...'
  },
  districtFilter: {
    en: 'District',
    si: 'දිස්ත්‍රික්කය',
    ta: 'மாவட்டம்'
  },
  allDistricts: {
    en: 'All 25 Districts',
    si: 'සියලු දිස්ත්‍රික්ක 25',
    ta: 'அனைத்து 25 மாவட்டங்கள்'
  },
  // AI Bot
  aiTagline: {
    en: 'Academic Tutor & Study Companion for Sri Lankan Students',
    si: 'ශ්‍රී ලාංකීය සිසුන් සඳහාම වන අධ්‍යාපනික AI සහායකයා',
    ta: 'இலங்கை மாணவர்களுக்கான கல்வி AI உதவியாளர்'
  },
  aiDisclaimer: {
    en: 'StudentHub AI is an educational study assistant powered by Google Gemini. Not a replacement for official teachers or exam boards.',
    si: 'StudentHub AI යනු Google Gemini බලගැන්වූ අධ්‍යාපන සහායකයෙකි. නිල විභාග මණ්ඩල හෝ ගුරුවරුන්ගේ ආදේශකයක් නොවේ.',
    ta: 'StudentHub AI என்பது Google Gemini மூலம் இயங்கும் கல்வி உதவியாளர். உத்தியோகபூர்ව ஆசிரியர்களின் மாற்றீடு அல்ல.'
  },
  newChat: {
    en: 'New Chat',
    si: 'නව සාකච්ඡාවක්',
    ta: 'புதிய உரையாடல்'
  },
  clearChat: {
    en: 'Clear History',
    si: 'ඉතිහාසය මකන්න',
    ta: 'வரலாற்றை அழிக்கவும்'
  },
  askAnything: {
    en: 'Ask a study question in English, Sinhala, or Tamil...',
    si: 'ඕනෑම අධ්‍යාපනික ගැටළුවක් සිංහල, ඉංග්‍රීසි හෝ දෙමළ භාෂාවෙන් අසන්න...',
    ta: 'ஆங்கிலம், சிங்களம் அல்லது தமிழில் உங்கள் சந்தேகங்களைக் கேளுங்கள்...'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('studenthub_lang');
      if (saved === 'si' || saved === 'ta' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('studenthub_lang', lang);
    } catch {}
  };

  const t = (key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
