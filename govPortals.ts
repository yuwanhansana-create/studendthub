export interface GovPortal {
  id: string;
  name: string;
  sinhalaName: string;
  tamilName: string;
  category: 'Exams & Results' | 'Textbooks & Materials' | 'E-Learning' | 'Ministry & Policy' | 'Higher Education' | 'Vocational & Training';
  url: string;
  description: string;
  sinhalaDescription: string;
  services: string[];
  isVerifiedGov: boolean;
  popular?: boolean;
}

export const GOV_EDUCATION_PORTALS: GovPortal[] = [
  {
    id: 'doenets-results',
    name: 'Department of Examinations (DoENETS)',
    sinhalaName: 'ශ්‍රී ලංකා විභාග දෙපාර්තමේන්තුව',
    tamilName: 'பரீட்சைத் திணைக்களம்',
    category: 'Exams & Results',
    url: 'https://www.doenets.lk/',
    description: 'Official Department of Examinations portal for examination timetables, applications, past papers, and evaluation reports.',
    sinhalaDescription: 'විභාග කාලසටහන්, අයදුම්පත්, පසුගිය ප්‍රශ්න පත්‍ර සහ විභාග තොරතුරු ලබාගන්න.',
    services: [
      'G.C.E. O/L Examination Timetables & Info',
      'G.C.E. A/L Examination Info & Applications',
      'Grade 5 Scholarship Examination',
      'Past Question Papers & Marking Schemes'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'doenets-direct-results',
    name: 'Online Examination Results Portal',
    sinhalaName: 'විභාග ප්‍රතිඵල සෘජු පිවිසුම',
    tamilName: 'பரீட்சை பெறுபேறுகள்',
    category: 'Exams & Results',
    url: 'https://results.doenets.lk/',
    description: 'Direct national portal to verify official O/L, A/L, and Grade 5 Scholarship results instantly by Index Number.',
    sinhalaDescription: 'විභාග අංකය ඇතුළත් කර ක්ෂණිකව නිල ප්‍රතිඵල පරීක්ෂා කරගන්න.',
    services: [
      'Live O/L, A/L & Grade 5 Results Verification',
      'Online Certificate Verification',
      'Instant Index Number Lookup'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'moe-sri-lanka',
    name: 'Ministry of Education Sri Lanka',
    sinhalaName: 'අධ්‍යාපන අමාත්‍යාංශය (ඉසුරුපාය)',
    tamilName: 'கல்வி அமைச்சு',
    category: 'Ministry & Policy',
    url: 'https://moe.gov.lk/',
    description: 'Official portal of the Ministry of Education (Isurupaya) for school circulars, school terms, grade admissions, and education policies.',
    sinhalaDescription: 'පාසල් චක්‍රලේඛ, පාසල් වාර සටහන්, 1 ශ්‍රේණිය හා අතරමැදි ඇතුළත් කිරීම් සහ නිල ප්‍රතිපත්ති.',
    services: [
      'Official School Circulars & Term Calendars',
      'Grade 1 & Intermediate School Admissions',
      'Student Welfare & Suraksha Insurance Guidelines',
      'National Educational Reforms & News'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'edupub-textbooks',
    name: 'Educational Publications Department (EduPub)',
    sinhalaName: 'අධ්‍යාපන ප්‍රකාශන දෙපාර්තමේන්තුව',
    tamilName: 'கல்வி வெளியீட்டுத் திணைக்களம்',
    category: 'Textbooks & Materials',
    url: 'http://www.edupub.gov.lk/',
    description: 'Free official school textbooks from Grade 1 to Grade 13 in Sinhala, Tamil, and English mediums in high-quality PDF.',
    sinhalaDescription: '1 ශ්‍රේණියේ සිට 13 ශ්‍රේණිය දක්වා සියලුම පෙළපොත් නොමිලේ PDF ලෙස බාගත කරගන්න.',
    services: [
      'Free School Textbooks (Grades 1 - 13)',
      'Sinhala, Tamil & English Mediums',
      'Teacher Guides & Supplementary Readers',
      'Supplementary Books'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'e-thaksalawa',
    name: 'e-Thaksalawa National E-Learning Portal',
    sinhalaName: 'ඊ-තක්සලාව ජාතික ඉගෙනුම් ද්වාරය',
    tamilName: 'ஈ-தக்சலாவ தேசிய கற்றல் தளம்',
    category: 'E-Learning',
    url: 'https://www.e-thaksalawa.moe.gov.lk/',
    description: 'National digital education learning platform provided by MOE featuring interactive lessons, videos, past exam questions, and activity sheets.',
    sinhalaDescription: 'අධ්‍යාපන අමාත්‍යාංශයේ ඩිජිටල් ඉගෙනුම් පද්ධතිය, අන්තර්ක්‍රියාකාරී පාඩම් හා අභ්‍යාස.',
    services: [
      'Interactive Grade 1 - 13 Syllabus Lessons',
      'Term Test Model Question Papers',
      'Digital Lesson Videos & Multimedia Activities',
      'National LMS for School Children'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'nie-sri-lanka',
    name: 'National Institute of Education (NIE)',
    sinhalaName: 'ජාතික අධ්‍යාපන ආයතනය (මහරගම)',
    tamilName: 'தேசிய கல்வி நிறுவகம்',
    category: 'E-Learning',
    url: 'https://www.nie.lk/',
    description: 'Apex body for national school curriculum design, syllabus frameworks, instructional teacher guides, and e-learning resources.',
    sinhalaDescription: 'නිල පාසල් විෂය නිර්දේශ (Syllabuses), ගුරු මාර්ගෝපදේශ හා අධ්‍යාපන පර්යේෂණ.',
    services: [
      'Official Syllabuses for all Grades & Subjects',
      'Teacher Instructional Guides (TIGs)',
      'GURUDHARANI LMS Portal',
      'Educational Research & Resource Materials'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'ugc-admissions',
    name: 'University Grants Commission (UGC)',
    sinhalaName: 'විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව',
    tamilName: 'பல்கலைக்கழக மானியங்கள் ஆணைக்குழு',
    category: 'Higher Education',
    url: 'https://www.ugc.ac.lk/',
    description: 'National portal for State University admissions, Z-score cut-off criteria, university handbooks, and degree accreditation.',
    sinhalaDescription: 'රාජ්‍ය විශ්වවිද්‍යාල ප්‍රවේශය, Z-Score කඩඉම් ලකුණු, විශ්වවිද්‍යාල අත්පොත සහ උපාධි පාඨමාලා.',
    services: [
      'University Online Application & Registration',
      'Z-Score Minimum Cut-Off Marks by District',
      'University Student Handbook Download',
      'Recognized Degrees & Institutes in Sri Lanka'
    ],
    isVerifiedGov: true,
    popular: true
  },
  {
    id: 'tvec-vocational',
    name: 'Tertiary & Vocational Education Commission (TVEC)',
    sinhalaName: 'තෘතීයික හා වෘත්තීය අධ්‍යාපන කොමිෂන් සභාව',
    tamilName: 'மூன்றாம் நிலை தொழிற்கல்வி ஆணைக்குழு',
    category: 'Vocational & Training',
    url: 'https://www.tvec.gov.lk/',
    description: 'Governing authority for National Vocational Qualifications (NVQ Levels 1-7), technical training colleges, and skills development.',
    sinhalaDescription: 'NVQ 1 සිට 7 දක්වා ජාතික වෘත්තීය සුදුසුකම්, කාර්මික විද්‍යාල සහ තාක්ෂණ පාඨමාලා.',
    services: [
      'National Vocational Qualification (NVQ) Framework',
      'Registered Vocational Institutes Directory',
      'Job-oriented Technical Courses Directory',
      'National Skills Passport (NSP)'
    ],
    isVerifiedGov: true
  },
  {
    id: 'naita-training',
    name: 'National Apprentice & Industrial Training Authority (NAITA)',
    sinhalaName: 'ජාතික ආධුනිකත්ව සහ කාර්මික පුහුණු කිරීමේ අධිකාරිය',
    tamilName: 'தேசிய பயிலுநர் மற்றும் கைத்தொழில் பயிற்சி அதிகாரசபை',
    category: 'Vocational & Training',
    url: 'http://www.naita.gov.lk/',
    description: 'Free industrial apprentice training, technical workshops, and enterprise-based career certifications.',
    sinhalaDescription: 'කාර්මික හා තාක්ෂණික ආධුනිකත්ව පුහුණු පාඨමාලා හා රැකියා පාදක සහතික.',
    services: [
      'Apprenticeship Training Schemes',
      'Specialized Craft & Engineering Courses',
      'Enterprise-based Industrial Placements'
    ],
    isVerifiedGov: true
  },
  {
    id: 'sliate-education',
    name: 'Sri Lanka Institute of Advanced Technological Education (SLIATE)',
    sinhalaName: 'ශ්‍රී ලංකා උසස් තාක්ෂණ අධ්‍යාපන ආයතනය',
    tamilName: 'இலங்கை உயர் தொழில்நுட்ப கல்வி நிறுவனம்',
    category: 'Higher Education',
    url: 'https://www.sliate.ac.lk/',
    description: 'Higher National Diploma (HND) courses in IT, Software Engineering, Business Finance, Management, and Agriculture.',
    sinhalaDescription: 'HND (Higher National Diploma) උසස් ඩිප්ලෝමා පාඨමාලා සහ තාක්ෂණික අධ්‍යාපනය.',
    services: [
      'HND in Information Technology (HNDIT)',
      'HND in Business, Accounting & Management',
      'HND in Engineering & Agriculture',
      'Advanced Technological Institutes (ATI) admissions'
    ],
    isVerifiedGov: true
  },
  {
    id: 'nenasa-edtech',
    name: 'Nenasa Smart School & TV Distance Learning',
    sinhalaName: 'නෙනස අධ්‍යාපනික රූපවාහිනී හා ස්මාර්ට් ඉගෙනුම',
    tamilName: 'நெனச கல்வி தொலைக்காட்சி',
    category: 'E-Learning',
    url: 'https://www.nenasa.lk/',
    description: 'Official educational broadcast TV and interactive digital learning library endorsed by the Ministry of Education.',
    sinhalaDescription: 'අධ්‍යාපනික රූපවාහිනී නාලිකා සහ ඩිජිටල් ස්මාර්ට් ඉගෙනුම් සම්පත්.',
    services: [
      'Nenasa TV Broadcast Schedules & Archives',
      'O/L and A/L revision tele-lessons',
      'Smart Classroom initiatives for schools'
    ],
    isVerifiedGov: true
  },
  {
    id: 'mohe-higher-edu',
    name: 'Ministry of Education (Higher Education Division)',
    sinhalaName: 'උසස් අධ්‍යාපන අංශය - අධ්‍යාපන අමාත්‍යාංශය',
    tamilName: 'உயர் கல்விப் பிரிவு',
    category: 'Higher Education',
    url: 'http://www.mohe.gov.lk/',
    description: 'Higher education scholarships, student interest-free loan schemes, and state higher education policy.',
    sinhalaDescription: 'විදේශ ශිෂ්‍යත්ව, පොලී රහිත ශිෂ්‍ය ණය යෝජනා ක්‍රම සහ උසස් අධ්‍යාපන ප්‍රතිපත්ති.',
    services: [
      'Non-State Higher Education Interest-Free Student Loan Scheme',
      'Foreign & Bilateral Government Scholarships',
      'Higher Education circulars and announcements'
    ],
    isVerifiedGov: true
  }
];
