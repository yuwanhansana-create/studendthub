export interface FounderProfile {
  name: string;
  role: string;
  phone: string;
  phoneTel: string;
  email: string;
  emailMailto: string;
  portfolioUrl: string;
  bio: string;
  technologyInterests: string[];
  vision: string;
  mission: string;
  story: string;
  location: string;
}

export const FOUNDER_DATA: FounderProfile = {
  name: 'G. Yuwan Senithu Hansana',
  role: 'Founder & Creator of StudentHub.lk',
  phone: '0740874972',
  phoneTel: 'tel:+94740874972',
  email: 'yuwanhansana@gmail.com',
  emailMailto: 'mailto:yuwanhansana@gmail.com',
  portfolioUrl: 'https://xinc.com/senithumt01',
  bio: 'StudentHub.lk is a Sri Lankan student-focused digital platform designed to connect students, share education-related information, and provide useful AI-powered learning tools.',
  location: 'Sri Lanka 🇱🇰',
  technologyInterests: [
    'Artificial Intelligence',
    'Web Development',
    'ICT',
    'AI Prompt Engineering',
    'Video Editing',
    'Technology & Automation'
  ],
  vision: 'To empower every student in Sri Lanka—across all 25 districts and 9 provinces—with equitable access to peer learning networks, high-quality digital academic resources, and intelligent AI-guided study assistance.',
  mission: 'To build a secure, privacy-first, and student-centric digital ecosystem that connects learners, simplifies school and exam workflows, and inspires innovation in ICT and technology across Sri Lanka.',
  story: 'StudentHub.lk was created with a clear purpose: to bridge the educational gap for Sri Lankan school and university students. Recognizing the need for safe student networking without exposing personal telephone numbers or emails, coupled with the rapid rise of modern AI learning tools and the necessity for verified government exam updates, StudentHub.lk was engineered from the ground up as Sri Lanka\'s dedicated student hub.'
};
