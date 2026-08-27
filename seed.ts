import bcrypt from 'bcryptjs';
import { db, UserRecord, PostRecord, NewsArticleRecord, FriendshipRecord, ConversationRecord, MessageRecord, NotificationRecord } from './db.js';

export async function seedDatabaseIfEmpty() {
  db.init();
  if (db.users.length > 0) {
    return;
  }

  console.log('Seeding StudentHub initial database...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Student@123', salt);
  const adminPasswordHash = await bcrypt.hash('Admin@123456', salt);

  const now = new Date();
  const subMinutes = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
  const subHours = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  const subDays = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

  // 1. Create Users
  const users: UserRecord[] = [
    {
      id: 'usr_admin',
      email: 'admin@studenthub.edu',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isSuspended: false,
      studentId: 'STU-ADM001',
      fullName: 'System Administrator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'StudentHub Safety & Platform Administration. Ensuring a secure educational space.',
      grade: 'Staff & Moderation',
      school: 'StudentHub Network Directorate',
      schoolVisibility: 'PUBLIC',
      gradeVisibility: 'PUBLIC',
      allowMessagesFrom: 'PUBLIC',
      allowRequestsFrom: 'PUBLIC',
      createdAt: subDays(60),
      updatedAt: subDays(1)
    },
    {
      id: 'usr_alex',
      email: 'alex.chen@oakridge.edu',
      username: 'alexchen',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isSuspended: false,
      studentId: 'STU-7A42K9',
      fullName: 'Alex Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      bio: 'Computer Science Major @ Stanford | Passionate about AI & distributed systems | Always open for study sessions!',
      grade: 'Undergraduate 3rd Year',
      school: 'Stanford University',
      schoolVisibility: 'PUBLIC',
      gradeVisibility: 'PUBLIC',
      allowMessagesFrom: 'FRIENDS_ONLY',
      allowRequestsFrom: 'PUBLIC',
      createdAt: subDays(45),
      updatedAt: subDays(2)
    },
    {
      id: 'usr_maya',
      email: 'maya.patel@berkeley.edu',
      username: 'mayapatel',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isSuspended: false,
      studentId: 'STU-9B81M2',
      fullName: 'Maya Patel',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      bio: 'Bioengineering & Pre-Med student. Researching CRISPR therapies. Coffee addict ☕',
      grade: 'Undergraduate 2nd Year',
      school: 'UC Berkeley',
      schoolVisibility: 'PUBLIC',
      gradeVisibility: 'PUBLIC',
      allowMessagesFrom: 'FRIENDS_ONLY',
      allowRequestsFrom: 'PUBLIC',
      createdAt: subDays(40),
      updatedAt: subDays(3)
    },
    {
      id: 'usr_liam',
      email: 'liam.davies@oxford.ac.uk',
      username: 'liamdavies',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isSuspended: false,
      studentId: 'STU-3D67V4',
      fullName: 'Liam Davies',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Physics & Applied Mathematics. Preparing for GRE & Quantum Mechanics finals. Chess player ♟️',
      grade: 'Grade 12 / Senior',
      school: 'St. Paul High School',
      schoolVisibility: 'PUBLIC',
      gradeVisibility: 'PUBLIC',
      allowMessagesFrom: 'FRIENDS_ONLY',
      allowRequestsFrom: 'PUBLIC',
      createdAt: subDays(30),
      updatedAt: subDays(1)
    },
    {
      id: 'usr_sophia',
      email: 'sophia.rodriguez@nyu.edu',
      username: 'sophiar',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isSuspended: false,
      studentId: 'STU-5X19P8',
      fullName: 'Sophia Rodriguez',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      bio: 'Economics & Environmental Policy student. Debate team captain. Organizing campus sustainability hackathons.',
      grade: 'Undergraduate 1st Year',
      school: 'New York University',
      schoolVisibility: 'PUBLIC',
      gradeVisibility: 'PUBLIC',
      allowMessagesFrom: 'FRIENDS_ONLY',
      allowRequestsFrom: 'PUBLIC',
      createdAt: subDays(20),
      updatedAt: subHours(12)
    },
    {
      id: 'usr_david',
      email: 'david.kim@mit.edu',
      username: 'davidkim',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isSuspended: false,
      studentId: 'STU-2M88L1',
      fullName: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      bio: 'Robotics & Mechatronics enthusiast. Building autonomous micro-rovers. Let us collaborate!',
      grade: 'Grade 11',
      school: 'Westfield STEM Academy',
      schoolVisibility: 'PUBLIC',
      gradeVisibility: 'PUBLIC',
      allowMessagesFrom: 'PUBLIC',
      allowRequestsFrom: 'PUBLIC',
      createdAt: subDays(15),
      updatedAt: subHours(5)
    }
  ];

  db.users.push(...users);

  // 2. Create Friendships & Requests
  const friendships: FriendshipRecord[] = [
    { id: 'fr_1', userId: 'usr_alex', friendId: 'usr_maya', createdAt: subDays(25) },
    { id: 'fr_2', userId: 'usr_maya', friendId: 'usr_alex', createdAt: subDays(25) },
    { id: 'fr_3', userId: 'usr_alex', friendId: 'usr_sophia', createdAt: subDays(15) },
    { id: 'fr_4', userId: 'usr_sophia', friendId: 'usr_alex', createdAt: subDays(15) },
    { id: 'fr_5', userId: 'usr_maya', friendId: 'usr_liam', createdAt: subDays(10) },
    { id: 'fr_6', userId: 'usr_liam', friendId: 'usr_maya', createdAt: subDays(10) }
  ];
  db.friendships.push(...friendships);

  // Pending request from David to Alex
  db.friendRequests.push({
    id: 'freq_1',
    senderId: 'usr_david',
    receiverId: 'usr_alex',
    status: 'PENDING',
    createdAt: subHours(4),
    updatedAt: subHours(4)
  });

  // Pending request from Liam to Alex
  db.friendRequests.push({
    id: 'freq_2',
    senderId: 'usr_liam',
    receiverId: 'usr_alex',
    status: 'PENDING',
    createdAt: subDays(1),
    updatedAt: subDays(1)
  });

  // 3. Create Posts
  const posts: PostRecord[] = [
    {
      id: 'post_1',
      authorId: 'usr_alex',
      content: 'Just finished summarizing our Algorithms & Data Structures semester review! Focusing especially on Dynamic Programming patterns (0/1 Knapsack, Longest Common Subsequence) and Graph shortest-paths. Check out our study group notes if you are preparing for midterm exams! 📚💻',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      category: 'Study Tips',
      isEdited: false,
      createdAt: subHours(2),
      updatedAt: subHours(2),
      likes: ['usr_maya', 'usr_sophia', 'usr_david'],
      comments: [
        {
          id: 'comm_1',
          postId: 'post_1',
          authorId: 'usr_maya',
          content: 'This is super helpful Alex! The matrix visualization for memoization was clean.',
          createdAt: subHours(1),
          updatedAt: subHours(1)
        },
        {
          id: 'comm_2',
          postId: 'post_1',
          authorId: 'usr_sophia',
          content: 'Count me in for the Thursday library review session! 🙌',
          createdAt: subMinutes(40),
          updatedAt: subMinutes(40)
        }
      ]
    },
    {
      id: 'post_2',
      authorId: 'usr_maya',
      content: 'Excited to announce that our university biotechnology lab has an open spot for a student research assistant for the upcoming semester! If anyone is studying organic chemistry, cellular biology, or genomics, feel free to send me a direct message for the application link.',
      category: 'Academic',
      isEdited: false,
      createdAt: subHours(7),
      updatedAt: subHours(7),
      likes: ['usr_alex', 'usr_liam'],
      comments: [
        {
          id: 'comm_3',
          postId: 'post_2',
          authorId: 'usr_david',
          content: 'Sent you a connection request Maya! I have experience with micro-fluidic sensors.',
          createdAt: subHours(4),
          updatedAt: subHours(4)
        }
      ]
    },
    {
      id: 'post_3',
      authorId: 'usr_sophia',
      content: 'Reminder for all high school and undergraduate students: the Global Youth Environmental Innovation Challenge deadline is next Friday! First prize includes a $15,000 university grant and mentorship from top climate researchers. Check the Education News tab for the official portal link!',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      category: 'Competitions',
      isEdited: false,
      createdAt: subDays(1),
      updatedAt: subDays(1),
      likes: ['usr_alex', 'usr_maya', 'usr_sophia', 'usr_david', 'usr_liam'],
      comments: []
    },
    {
      id: 'post_4',
      authorId: 'usr_liam',
      content: 'Pro-tip for STEM students struggling with multi-variable calculus and thermodynamics: try Feynman Technique where you explain each theorem aloud to yourself without textbook jargon. Found so many blind spots in Stokes Theorem that way!',
      category: 'Study Tips',
      isEdited: false,
      createdAt: subDays(2),
      updatedAt: subDays(2),
      likes: ['usr_alex', 'usr_sophia'],
      comments: [
        {
          id: 'comm_4',
          postId: 'post_4',
          authorId: 'usr_alex',
          content: '100% agree. Testing yourself actively beats passive rereading every single time.',
          createdAt: subDays(1),
          updatedAt: subDays(1)
        }
      ]
    }
  ];
  db.posts.push(...posts);

  // 4. Create Education News (All 8 Required Categories)
  const news: NewsArticleRecord[] = [
    {
      id: 'news_1',
      title: 'Global STEM Undergraduate Research Fellowship 2026 Opens Nominations',
      slug: 'global-stem-undergraduate-research-fellowship-2026',
      summary: 'Fully funded research grants of up to $25,000 for undergraduate students pursuing cutting-edge research in artificial intelligence, biotechnology, and clean energy.',
      content: `The International Academic Council has officially inaugurated the 2026 Global STEM Research Fellowship. Geared towards high-achieving undergraduate students in their 2nd, 3rd, or 4th years, the fellowship provides direct stipends, institutional laboratory matching, and global conference sponsorship.\n\n### Eligibility Criteria:\n- Enrolled in an accredited STEM degree program.\n- Minimum GPA of 3.4 or equivalent academic standing.\n- Proposed 12-month research abstract endorsed by a faculty mentor.\n\n### Application Timeline:\n- Priority Submissions: November 15, 2026\n- Final Closing Date: January 10, 2027\n\nRecipients will be paired with leading research scientists across partner universities in North America, Europe, and Asia-Pacific.`,
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      category: 'Scholarships',
      source: 'Global Academic Exchange',
      authorName: 'Dr. Elena Vance, Council Director',
      isFeatured: true,
      isPublished: true,
      publishedAt: subHours(6),
      createdAt: subHours(8),
      updatedAt: subHours(6)
    },
    {
      id: 'news_2',
      title: 'National Standardized Exam Schedule and Digital Assessment Guidelines Released',
      slug: 'national-standardized-exam-schedule-digital-guidelines',
      summary: 'Comprehensive schedule for Advanced Placement, SAT, and International Baccalaureate examinations with updated digital calculator policies.',
      content: `Education testing authorities have released official guidelines for the upcoming examination cycle. Major updates include increased accommodation windows for neurodiverse learners, streamlined digital testing interfaces, and standardized testing room device protocols.\n\nKey dates have been locked for early summer testing sessions. Students are advised to verify their registration status through their regional institutional portal before the late registration deadline.`,
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      category: 'Examinations',
      source: 'National Examination Board',
      authorName: 'StudentHub Academic Desk',
      isFeatured: true,
      isPublished: true,
      publishedAt: subDays(1),
      createdAt: subDays(1),
      updatedAt: subDays(1)
    },
    {
      id: 'news_3',
      title: 'International Student Hackathon: Building Sustainable Campus Solutions',
      slug: 'international-student-hackathon-sustainable-campus',
      summary: 'Over 500 universities worldwide to participate in a 48-hour global virtual hackathon focused on climate tech and campus circular economy apps.',
      content: `Organized by student engineering societies across 40 countries, the ClimateHack 2026 invites student teams to develop open-source web and IoT solutions that tackle food waste, energy monitoring, and sustainable transit on school campuses.\n\n### Prizes & Mentorship:\n- $40,000 Total Prize Pool\n- Cloud credits and GPU compute sponsored by major technology organizations\n- Fast-track interview opportunities with green tech incubators\n\nRegistrations are open for solo students as well as teams of up to 4 members.`,
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      category: 'Competitions',
      source: 'Global Student Tech League',
      authorName: 'Marcus Vance',
      isFeatured: false,
      isPublished: true,
      publishedAt: subDays(2),
      createdAt: subDays(2),
      updatedAt: subDays(2)
    },
    {
      id: 'news_4',
      title: 'New AI Literacy and Ethics Curriculum Adopted Across 1,200 High Schools',
      slug: 'ai-literacy-ethics-curriculum-adopted-schools',
      summary: 'Ministries of Education launch pilot modules teaching machine learning fundamentals, algorithm bias awareness, and responsible digital citizenship.',
      content: `In a landmark policy initiative, educators have rolled out comprehensive modules for grades 9 through 12. The syllabus blends theoretical computer science concepts with real-world case studies surrounding data privacy, generative AI attribution, and intellectual property rights in academic environments.`,
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
      category: 'Education Policies',
      source: 'Department of Educational Innovation',
      authorName: 'Claire Thornton',
      isFeatured: false,
      isPublished: true,
      publishedAt: subDays(3),
      createdAt: subDays(3),
      updatedAt: subDays(3)
    },
    {
      id: 'news_5',
      title: 'Next-Gen Quantum Computing Student Labs Launched in Collaborative Alliance',
      slug: 'quantum-computing-student-labs-launched',
      summary: 'High school and undergraduate students gain remote cloud access to 127-qubit quantum processors for physics and computer science projects.',
      content: `A consortium of universities and leading quantum computing research institutions has announced the Quantum Youth Access Initiative. Students can submit Python and Qiskit algorithms to execute experiments on actual superconducting qubit hardware during reserved educational windows.`,
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
      category: 'ICT & Technology',
      source: 'Quantum Education Initiative',
      authorName: 'Prof. Hiroshi Tanaka',
      isFeatured: false,
      isPublished: true,
      publishedAt: subDays(4),
      createdAt: subDays(4),
      updatedAt: subDays(4)
    },
    {
      id: 'news_6',
      title: 'Erasmus+ and Fulbright Announce Expanded Bilateral Exchange Opportunities for 2026/27',
      slug: 'expanded-bilateral-exchange-opportunities-2026',
      summary: 'Record number of semester abroad travel stipends and visa facilitation agreements approved for international student mobility.',
      content: `Global mobility programs have expanded their quotas by 35% for the upcoming academic year. Enhanced cost-of-living adjustments have been factored into all student stipends to assist with international housing and academic supplies.`,
      coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
      category: 'International Education',
      source: 'Global Student Mobility Commission',
      authorName: 'Sarah Lindqvist',
      isFeatured: false,
      isPublished: true,
      publishedAt: subDays(5),
      createdAt: subDays(5),
      updatedAt: subDays(5)
    },
    {
      id: 'news_7',
      title: 'United Nations Youth Climate Summit Delegate Nominations Open for Student Leaders',
      slug: 'un-youth-climate-summit-delegate-nominations',
      summary: 'Fully sponsored travel and credentialing for 200 student delegates to present policy proposals at the annual UN General Assembly in Geneva.',
      content: `Student leaders between ages 16 and 24 who have demonstrated impactful grassroots sustainability initiatives in their schools or communities are encouraged to apply. Delegates will collaborate on binding youth policy statements presented directly to international ministers.`,
      coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      category: 'Student Opportunities',
      source: 'UN Youth Affairs',
      authorName: 'Ambassador K. Morales',
      isFeatured: false,
      isPublished: true,
      publishedAt: subDays(6),
      createdAt: subDays(6),
      updatedAt: subDays(6)
    },
    {
      id: 'news_8',
      title: 'Campus Facility Upgrades and Sustainable Library Hubs Announced for Fall Term',
      slug: 'campus-facility-upgrades-sustainable-library-hubs',
      summary: 'Regional school districts unveil 24/7 collaborative digital learning commons with high-speed fiber internet and private soundproof study pods.',
      content: `Renovations to secondary school and collegiate libraries emphasize hybrid study needs, featuring dedicated podcast and video presentation studios, 3D printing maker-spaces, and ergonomic collaborative workbenches.`,
      coverImage: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
      category: 'School Updates',
      source: 'Educational Infrastructure Board',
      authorName: 'David Sterling',
      isFeatured: false,
      isPublished: true,
      publishedAt: subDays(7),
      createdAt: subDays(7),
      updatedAt: subDays(7)
    }
  ];
  db.news.push(...news);

  // 5. Create Sample Conversations & Messages
  const conversationId = 'conv_alex_maya';
  const conv: ConversationRecord = {
    id: conversationId,
    participantIds: ['usr_alex', 'usr_maya'],
    updatedAt: subMinutes(15),
    createdAt: subDays(5)
  };
  db.conversations.push(conv);

  const messages: MessageRecord[] = [
    {
      id: 'msg_1',
      conversationId: conversationId,
      senderId: 'usr_maya',
      content: 'Hey Alex! Are you joining the Algorithm study session tomorrow at the science library?',
      isRead: true,
      createdAt: subHours(3)
    },
    {
      id: 'msg_2',
      conversationId: conversationId,
      senderId: 'usr_alex',
      content: 'Hey Maya! Yes, definitely. I prepared some practice problems on graph traversal and Dijkstra algorithm.',
      isRead: true,
      createdAt: subHours(2)
    },
    {
      id: 'msg_3',
      conversationId: conversationId,
      senderId: 'usr_maya',
      content: 'Awesome! See you around 3 PM in Room 402. Let me know if you need the problem set PDF beforehand.',
      isRead: false,
      createdAt: subMinutes(15)
    }
  ];
  db.messages.push(...messages);

  // 6. Create Sample Notifications
  const notifications: NotificationRecord[] = [
    {
      id: 'notif_1',
      userId: 'usr_alex',
      actorId: 'usr_david',
      type: 'FRIEND_REQUEST',
      title: 'New Friend Request',
      message: 'David Kim (STU-2M88L1) sent you a friend request.',
      link: '/friends?tab=requests',
      isRead: false,
      createdAt: subHours(4)
    },
    {
      id: 'notif_2',
      userId: 'usr_alex',
      actorId: 'usr_maya',
      type: 'POST_LIKE',
      title: 'Liked your post',
      message: 'Maya Patel liked your post on Algorithms & Data Structures.',
      link: '/feed#post_1',
      isRead: true,
      createdAt: subHours(1)
    },
    {
      id: 'notif_3',
      userId: 'usr_alex',
      type: 'NEWS_ANNOUNCEMENT',
      title: 'Featured Opportunity',
      message: 'Global STEM Undergraduate Research Fellowship 2026 is now accepting applications!',
      link: '/news/global-stem-undergraduate-research-fellowship-2026',
      isRead: false,
      createdAt: subHours(6)
    }
  ];
  db.notifications.push(...notifications);

  db.save();
  console.log('Database successfully seeded with students, news, friendships, and posts.');
}
