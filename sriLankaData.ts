export interface DistrictInfo {
  name: string;
  province: string;
}

export const SRI_LANKA_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province'
];

export const SRI_LANKA_DISTRICTS: DistrictInfo[] = [
  // Western
  { name: 'Colombo', province: 'Western Province' },
  { name: 'Gampaha', province: 'Western Province' },
  { name: 'Kalutara', province: 'Western Province' },
  // Central
  { name: 'Kandy', province: 'Central Province' },
  { name: 'Matale', province: 'Central Province' },
  { name: 'Nuwara Eliya', province: 'Central Province' },
  // Southern
  { name: 'Galle', province: 'Southern Province' },
  { name: 'Matara', province: 'Southern Province' },
  { name: 'Hambantota', province: 'Southern Province' },
  // Northern
  { name: 'Jaffna', province: 'Northern Province' },
  { name: 'Kilinochchi', province: 'Northern Province' },
  { name: 'Mannar', province: 'Northern Province' },
  { name: 'Vavuniya', province: 'Northern Province' },
  { name: 'Mullaitivu', province: 'Northern Province' },
  // Eastern
  { name: 'Batticaloa', province: 'Eastern Province' },
  { name: 'Ampara', province: 'Eastern Province' },
  { name: 'Trincomalee', province: 'Eastern Province' },
  // North Western
  { name: 'Kurunegala', province: 'North Western Province' },
  { name: 'Puttalam', province: 'North Western Province' },
  // North Central
  { name: 'Anuradhapura', province: 'North Central Province' },
  { name: 'Polonnaruwa', province: 'North Central Province' },
  // Uva
  { name: 'Badulla', province: 'Uva Province' },
  { name: 'Monaragala', province: 'Uva Province' },
  // Sabaragamuwa
  { name: 'Ratnapura', province: 'Sabaragamuwa Province' },
  { name: 'Kegalle', province: 'Sabaragamuwa Province' }
];

export const DISTRICT_TO_PROVINCE: Record<string, string> = SRI_LANKA_DISTRICTS.reduce((acc, d) => {
  acc[d.name] = d.province;
  return acc;
}, {} as Record<string, string>);

export const DISTRICT_NAMES: string[] = SRI_LANKA_DISTRICTS.map(d => d.name);

export const SRI_LANKA_GRADE_LEVELS = [
  'Grade 1 - 5 (Primary / Scholarship)',
  'Grade 6 - 9 (Junior Secondary)',
  'Grade 10 - 11 (G.C.E. O/L)',
  'G.C.E. A/L — Physical Science (Combined Maths)',
  'G.C.E. A/L — Biological Science',
  'G.C.E. A/L — Commerce',
  'G.C.E. A/L — Arts & Humanities',
  'G.C.E. A/L — Technology (ET / BST)',
  'Undergraduate (State University)',
  'Undergraduate (Private / Non-State)',
  'Vocational / NVQ / SLATI / HND',
  'Postgraduate / Research',
  'Teacher / Educator'
];

export const SRI_LANKA_EDUCATION_CATEGORIES = [
  'All Categories',
  '🇱🇰 Sri Lanka Education',
  '📝 Examinations',
  '🎓 Scholarships',
  '🏆 Competitions & Olympiads',
  '💻 ICT & Technology',
  '🏫 School Updates',
  '📚 Learning Opportunities',
  '🌍 International Education',
  '🎯 Student Opportunities'
];

export const SRI_LANKA_FEED_CATEGORIES = [
  'G.C.E. A/L Combined Maths',
  'G.C.E. A/L Physics & Chemistry',
  'G.C.E. A/L Biology',
  'G.C.E. A/L Commerce & Accounting',
  'G.C.E. A/L Arts & Languages',
  'G.C.E. A/L Technology Stream',
  'G.C.E. O/L Science & Maths',
  'English & General Knowledge',
  'ICT & Software Development',
  'University & Campus Life',
  'Scholarships & Competitions',
  'Study Tips & Motivation'
];

export const SRI_LANKA_SUBJECTS_LIST = [
  // A/L Physical Science & Bio
  'Combined Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Agricultural Science',
  // A/L Commerce
  'Accounting',
  'Business Studies',
  'Economics',
  // A/L Tech
  'Engineering Technology',
  'Bio-Systems Technology',
  'Science for Technology',
  'Information & Communication Technology (ICT)',
  // A/L Arts
  'Sinhala Language & Literature',
  'Tamil Language & Literature',
  'English Literature',
  'Logic & Scientific Method',
  'Political Science',
  'History (Sri Lankan & World)',
  'Geography',
  'Buddhist Culture / Christian / Hindu / Islamic Culture',
  'Media & Communication Studies',
  'Art & Drama',
  // O/L Core
  'Mathematics',
  'Science',
  'English Language',
  'Sinhala / Tamil First Language',
  'History',
  'Religion (Buddhism/Christianity/Hinduism/Islam)',
  'Commerce / Business & Accounting Studies',
  'Information & Communication Tech (O/L)'
];

export const SRI_LANKA_POPULAR_INSTITUTES = [
  'Royal College, Colombo',
  'Ananda College, Colombo',
  'Visakha Vidyalaya, Colombo',
  'Nalanda College, Colombo',
  'Devi Balika Vidyalaya, Colombo',
  'Dharmaraja College, Kandy',
  'Mahinda College, Galle',
  'Richmond College, Galle',
  'Kingswood College, Kandy',
  'Trinity College, Kandy',
  'Jaffna Hindu College',
  'St. Patrick\'s College, Jaffna',
  'St. Thomas\' College, Mt. Lavinia',
  'St. Joseph\'s College, Colombo',
  'Ladies\' College, Colombo',
  'Bishop\'s College, Colombo',
  'Maliyadeva College, Kurunegala',
  'Rahula College, Matara',
  'Sujatha Vidyalaya, Matara',
  'Sirimavo Bandaranaike Vidyalaya, Colombo',
  'St. Anthony\'s College, Kandy',
  'Vembadi Girls\' High School, Jaffna',
  'Hartley College, Point Pedro',
  'Badulla Central College',
  'Anuradhapura Central College',
  'Taxila Central College, Horana',
  'Bandaranayake College, Gampaha',
  'Rathnavali Balika Vidyalaya, Gampaha',
  'University of Colombo',
  'University of Peradeniya',
  'University of Moratuwa',
  'University of Sri Jayewardenepura',
  'University of Kelaniya',
  'University of Ruhuna',
  'University of Jaffna',
  'Eastern University, Sri Lanka',
  'South Eastern University',
  'Rajarata University',
  'Wayamba University',
  'Sabaragamuwa University',
  'Uva Wellassa University',
  'Open University of Sri Lanka (OUSL)',
  'SLIIT',
  'NSBM Green University',
  'IIT (Informatics Institute of Technology)',
  'CINEC Campus',
  'NIBM / NIBM National Institute of Business Management'
];

export const OFFICIAL_EDUCATION_RESOURCES = [
  {
    name: 'Department of Examinations (DoENets)',
    url: 'https://www.doenets.lk',
    description: 'Official results, timetables, and past exam question papers for O/L and A/L.'
  },
  {
    name: 'Ministry of Education, Sri Lanka',
    url: 'https://moe.gov.lk',
    description: 'Curriculum updates, school calendar, and circulars.'
  },
  {
    name: 'University Grants Commission (UGC)',
    url: 'https://www.ugc.ac.lk',
    description: 'University admissions, Z-score cutoffs, and handbook for A/L candidates.'
  },
  {
    name: 'National Institute of Education (NIE)',
    url: 'https://nie.lk',
    description: 'Syllabi, teacher instructional manuals, and textbook guides.'
  },
  {
    name: 'e-Thaksalawa (National e-Learning Portal)',
    url: 'https://www.e-thaksalawa.moe.gov.lk',
    description: 'Official government digital textbook and interactive lesson repository.'
  },
  {
    name: 'ICTA (Information & Communication Technology Agency)',
    url: 'https://icta.gov.lk',
    description: 'Digital education and national tech initiatives.'
  }
];

export const AI_QUICK_STUDY_PROMPTS = [
  {
    category: 'G.C.E. A/L Combined Maths',
    prompt: 'Explain Integration by Parts with an intuitive step-by-step example suitable for Sri Lankan G.C.E. A/L Combined Maths.',
    sinhala: 'G.C.E. A/L සංයුක්ත ගණිතය සඳහා කොටස් වශයෙන් අනුකලනය (Integration by Parts) සරලව පැහැදිලි කරන්න.',
    tamil: 'இலங்கை G.C.E. A/L கணிதத்திற்கான Integration by Parts முறையை எளிதாக விளக்குக.'
  },
  {
    category: 'G.C.E. A/L Physics',
    prompt: 'Explain Bernoulli\'s Principle and continuity equation in fluid mechanics with Sri Lankan exam tips.',
    sinhala: 'ද්‍රව යාන්ත්‍ර විද්‍යාවේ බර්නූලි මූලධර්මය සහ ප්‍රවාහ සන්තතික සමීකරණය උදාහරණ සහිතව පැහැදිලි කරන්න.',
    tamil: 'பெர்னூலியின் தத்துவம் (Bernoulli\'s Principle) மற்றும் அதன் பயன்பாடுகளை விளக்குக.'
  },
  {
    category: 'G.C.E. A/L Biology',
    prompt: 'Compare C3, C4, and CAM photosynthetic pathways and why tropical plants in Sri Lanka adapt this way.',
    sinhala: 'C3, C4 සහ CAM ප්‍රභාසංස්ලේෂක මාර්ග සංසන්දනය කර ශ්‍රී ලංකාවේ ශාක අනුවර්තනය පැහැදිලි කරන්න.',
    tamil: 'C3, C4 மற்றும் CAM ஒளிச்சேர்க்கை பாதைகளை ஒப்பிட்டு விளக்குக.'
  },
  {
    category: 'ICT & Coding',
    prompt: 'Explain SQL Normalization (1NF, 2NF, 3NF) with a simple Sri Lankan school database example.',
    sinhala: 'පාසල් දත්ත ගබඩාවක් උදාහරණ කර ගනිමින් SQL දත්ත සමීකරණය (1NF, 2NF, 3NF) පැහැදිලි කරන්න.',
    tamil: 'SQL Normalization (1NF, 2NF, 3NF) அடிப்படைகளை எளிய உதாரணத்துடன் விளக்குக.'
  },
  {
    category: 'Study Planning',
    prompt: 'Create a balanced 30-day revision timetable for a Sri Lankan G.C.E. A/L student with active recall intervals.',
    sinhala: 'ශ්‍රී ලංකා A/L විභාග අපේක්ෂකයෙකු සඳහා දින 30ක ඵලදායී පාඩම් කාලසටහනක් සාදා දෙන්න.',
    tamil: 'A/L பரீட்சைக்கான 30 நாள் பயனுள்ள மீளாய்வு அட்டவணையை தயார் செய்க.'
  },
  {
    category: 'English & Translation',
    prompt: 'Translate and explain key academic ICT terminology between Sinhala, Tamil, and English.',
    sinhala: 'ICT විෂයේ ප්‍රධාන වචන සිංහල හා ඉංග්‍රීසි භාෂාවෙන් පැහැදිලි කරන්න.',
    tamil: 'ICT முக்கிய சொற்களை தமிழ் மற்றும் ஆங்கிலத்தில் விளக்குக.'
  }
];
