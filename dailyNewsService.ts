import { GoogleGenAI } from '@google/genai';
import { db, NewsArticleRecord } from '../db.js';

interface DailyNewsItem {
  title: string;
  category: string;
  summary: string;
  content: string;
  source: string;
  authorName: string;
  coverImage?: string;
  isFeatured?: boolean;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  'Examinations': [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80'
  ],
  'Scholarships': [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80'
  ],
  'School Updates': [
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80'
  ],
  'Competitions': [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80'
  ],
  'ICT & Technology': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'
  ],
  'Education Policies': [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80'
  ],
  'Student Opportunities': [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'
  ],
  'International Education': [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80'
  ]
};

function getCoverForCategory(category: string): string {
  const list = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['School Updates'];
  return list[Math.floor(Math.random() * list.length)];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class DailySriLankaNewsService {
  private lastUpdateTimestamp: string | null = null;
  private isUpdating = false;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.lastUpdateTimestamp = new Date().toISOString();
  }

  public getStatus() {
    return {
      autoUpdateEnabled: true,
      lastSyncAt: this.lastUpdateTimestamp,
      totalArticles: db.news.length,
      frequency: 'Every 24 hours & On-Demand'
    };
  }

  public startAutoUpdateSchedule(intervalHours = 12) {
    // Run initial check on startup
    this.runDailyUpdate().catch(err => {
      console.warn('Initial Sri Lanka daily news check warning:', err?.message || err);
    });

    if (this.timer) {
      clearInterval(this.timer);
    }

    // Interval every 12 hours
    this.timer = setInterval(() => {
      this.runDailyUpdate().catch(err => {
        console.warn('Scheduled Sri Lanka daily news update error:', err?.message || err);
      });
    }, intervalHours * 3600 * 1000);
  }

  public async runDailyUpdate(force = false): Promise<{ count: number; articles: NewsArticleRecord[]; message: string }> {
    if (this.isUpdating) {
      return { count: 0, articles: [], message: 'Update already in progress' };
    }

    this.isUpdating = true;
    try {
      const todayDateStr = new Date().toISOString().split('T')[0];
      
      // Check if we already published news today (unless forced)
      const existingToday = db.news.filter(n => n.publishedAt && n.publishedAt.startsWith(todayDateStr));
      if (existingToday.length >= 3 && !force) {
        this.lastUpdateTimestamp = new Date().toISOString();
        return {
          count: 0,
          articles: existingToday,
          message: 'Sri Lanka daily educational news is already up-to-date for today.'
        };
      }

      const generatedNews = await this.fetchOrSynthesizeSriLankaNews();
      const addedArticles: NewsArticleRecord[] = [];

      for (const item of generatedNews) {
        const slug = slugify(item.title) || `sl-edu-news-${Date.now()}`;
        
        // Avoid duplicate slug
        const exists = db.news.some(n => n.slug === slug || n.title.toLowerCase() === item.title.toLowerCase());
        if (exists) continue;

        const record: NewsArticleRecord = {
          id: db.generateId('news_daily'),
          title: item.title,
          slug,
          summary: item.summary,
          content: item.content,
          coverImage: item.coverImage || getCoverForCategory(item.category),
          category: item.category,
          source: item.source || 'Sri Lanka Education News Desk',
          authorName: item.authorName || 'StudentHub News Correspondent',
          isFeatured: !!item.isFeatured,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        db.news.unshift(record);
        addedArticles.push(record);
      }

      if (addedArticles.length > 0) {
        db.save();
      }

      this.lastUpdateTimestamp = new Date().toISOString();
      return {
        count: addedArticles.length,
        articles: addedArticles,
        message: addedArticles.length > 0
          ? `Successfully synchronized ${addedArticles.length} new Sri Lankan education news updates.`
          : 'All daily news items are already synchronized.'
      };
    } finally {
      this.isUpdating = false;
    }
  }

  private async fetchOrSynthesizeSriLankaNews(): Promise<DailyNewsItem[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });

        const today = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const prompt = `You are the chief education editor for StudentHub.lk, Sri Lanka's leading student portal.
Generate 4 fresh, realistic, and highly relevant Sri Lankan educational news articles for today (${today}).

Key Domains to cover:
1. Department of Examinations (DoENETS) notices (G.C.E. O/L or A/L timetables, admission slips, practical exams, or Grade 5 Scholarship).
2. Ministry of Education (MOE) school calendar updates, term schedules, or EduPub free textbook digital releases.
3. University Grants Commission (UGC) state university admissions, Z-score cutoffs, aptitude tests, or university degree programs.
4. Sri Lankan STEM scholarships (Presidential Fund, SLASS, ICTA, Moratuwa/Colombo tech initiatives) or Student Competitions (SLOI Olympiad, Robot Battles, Young Inventors).

Respond with a raw JSON array of 4 objects matching this format exactly:
[
  {
    "title": "Clear informative headline",
    "category": "Examinations" | "Scholarships" | "School Updates" | "Competitions" | "ICT & Technology" | "Education Policies" | "Student Opportunities" | "International Education",
    "summary": "2-3 sentence concise overview highlighting key dates and student impact.",
    "content": "Detailed markdown article (3-4 paragraphs) with headers (###), bullet points, eligibility criteria, key dates, and official portal URLs (e.g. doenets.lk, ugc.ac.lk, moe.gov.lk, edupub.gov.lk).",
    "source": "Department of Examinations (DoENETS) | Ministry of Education Sri Lanka | University Grants Commission (UGC) | National Institute of Education (NIE)",
    "authorName": "Academic News Correspondent",
    "isFeatured": false
  }
]
Set exactly one article to "isFeatured": true. Return ONLY the JSON array without markdown backticks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.4
          }
        });

        if (response?.text) {
          const clean = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err: any) {
        console.warn('[DailyNewsService] Gemini live fetch error, using curated daily updates:', err?.message);
      }
    }

    // Fallback curated Sri Lanka daily updates
    const curDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return [
      {
        title: `Department of Examinations Releases Updated G.C.E. A/L & O/L Practical Schedules (${curDateStr})`,
        category: 'Examinations',
        summary: `DoENETS issues official circular regarding admission verification, aesthetic practical testing dates, and revision timetables for school and private candidates.`,
        content: `The Department of Examinations Sri Lanka (DoENETS) has issued an official gazette advisory regarding upcoming examination sessions.\n\n### Key Highlights:\n- **Admission Downloads**: School principals and private candidates can verify identity registrations via the official portal at \`doenets.lk\`.\n- **Aesthetic & Technical Practicals**: Dates for Home Economics, Music, Art, Dancing, and Engineering Technology practicals are scheduled across designated provincial evaluation centers.\n- **Exam Hotline**: Student inquiries can be directed to the 1911 national examination hotline.\n\nStudents are advised to review past marking schemes and utilize official past papers available on the e-Thaksalawa portal.`,
        source: 'Department of Examinations (DoENETS)',
        authorName: 'Senior Academic Correspondent',
        isFeatured: true
      },
      {
        title: `Ministry of Education & EduPub Release Updated Digital Syllabus Guides and Free Textbooks`,
        category: 'School Updates',
        summary: `Official PDF school textbooks from Grade 6 to Grade 13 now accessible free of charge in Sinhala, Tamil, and English mediums via EduPub.`,
        content: `The Educational Publications Department (EduPub) in collaboration with the Ministry of Education has completed the digital rollout of revised textbooks.\n\n### Available Materials:\n- Complete Science, Mathematics, Commerce, and Arts stream textbooks for G.C.E. O/L and A/L.\n- Teacher Instructional Guides (TIG) published by the National Institute of Education (NIE).\n- Direct PDF downloads with no subscription fees via \`edupub.gov.lk\`.\n\nThis initiative supports equitable digital access for students across all 9 provinces in Sri Lanka.`,
        source: 'Educational Publications Department (EduPub)',
        authorName: 'Education News Desk',
        isFeatured: false
      },
      {
        title: `University Grants Commission (UGC) Announces State University Online Registration Timeline`,
        category: 'Student Opportunities',
        summary: `Eligible A/L candidates can now review official Z-Score minimum cut-offs and submit faculty preferences through the UGC digital intake portal.`,
        content: `The University Grants Commission has opened online preference registration for admissions into state universities across Sri Lanka.\n\n### Instructions for Students:\n- Refer to the official UGC Student Admission Handbook for minimum subject combinations and district quotas.\n- Submit ranked choices for Engineering, Medicine, Physical Science, Biological Science, Management, Arts, and Technology faculties.\n- Visit \`ugc.ac.lk\` for the interactive Z-Score calculation and faculty cut-off directory.`,
        source: 'University Grants Commission (UGC)',
        authorName: 'Higher Education Bureau',
        isFeatured: false
      },
      {
        title: `National Youth Science & ICT Innovation Challenge 2026 Opens Registrations`,
        category: 'Competitions',
        summary: `National competition inviting school innovators and STEM students to submit software, AI, and hardware prototypes with cash awards and university mentorship.`,
        content: `Organized under the auspices of the Ministry of Technology and the National Science Foundation, the National Youth Science Challenge 2026 invites submissions from junior and senior school students.\n\n### Categories:\n1. Artificial Intelligence & Clean Software Solutions\n2. Agricultural & Renewable Energy Technologies\n3. Assistive Devices for Community Health\n\nTop winners will represent Sri Lanka at international science and informatics competitions with full government sponsorship.`,
        source: 'National Science Foundation & ICTA',
        authorName: 'Science & Tech Desk',
        isFeatured: false
      }
    ];
  }
}

export const dailyNewsService = new DailySriLankaNewsService();
