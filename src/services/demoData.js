// Rich sample/demo data to ensure Dex Elearning is engaging, interactive, and fully testable out-of-the-box

export const DEMO_COURSES = [
  {
    _id: 'demo-p3-math',
    id: 'demo-p3-math',
    title: 'Multiplication Magic & Geometry Shapes',
    description: 'Learn times tables with fun animal tricks, explore 2D and 3D shapes, and master primary geometry through visual puzzles.',
    gradeLevel: 'Primary 3',
    category: 'mathematics',
    thumbnailEmoji: '🚀',
    price: 0,
    isDemo: true,
    instructor: { name: 'Teacher Aline Mukamana' },
    rating: { average: 4.9, count: 28 },
    lessonsCount: 3,
  },
  {
    _id: 'demo-p1-phonics',
    id: 'demo-p1-phonics',
    title: 'Fun Phonics & Storytelling Magic',
    description: 'Sound out letters, build words with fun rhyming songs, and read your first storybooks with colorful illustrations.',
    gradeLevel: 'Primary 1',
    category: 'english',
    thumbnailEmoji: '🎒',
    price: 0,
    isDemo: true,
    instructor: { name: 'Teacher Diane Ingabire' },
    rating: { average: 5.0, count: 34 },
    lessonsCount: 2,
  },
  {
    _id: 'demo-p2-science',
    id: 'demo-p2-science',
    title: 'Animal Kingdom & Plant Life Wonders',
    description: 'Discover how animals adapt, how seeds sprout into giant trees, and the beauty of nature in Rwanda and beyond.',
    gradeLevel: 'Primary 2',
    category: 'science',
    thumbnailEmoji: '🎨',
    price: 0,
    isDemo: true,
    instructor: { name: 'Teacher Jean Claude Uwera' },
    rating: { average: 4.8, count: 19 },
    lessonsCount: 2,
  },
  {
    _id: 'demo-p4-social',
    id: 'demo-p4-social',
    title: 'Rwanda History & Geography Explorers',
    description: 'Journey through the land of a thousand hills, discover lakes, national parks, and celebrate Rwandan cultural heritage.',
    gradeLevel: 'Primary 4',
    category: 'social-studies',
    thumbnailEmoji: '🧬',
    price: 0,
    isDemo: true,
    instructor: { name: 'Teacher Patrick Habimana' },
    rating: { average: 4.9, count: 42 },
    lessonsCount: 3,
  },
  {
    _id: 'demo-p5-science',
    id: 'demo-p5-science',
    title: 'Electricity, Magnetism & Solar System',
    description: 'Understand simple electrical circuits, how magnets work, and take a cosmic journey through our planetary neighborhood.',
    gradeLevel: 'Primary 5',
    category: 'science',
    thumbnailEmoji: '🌍',
    price: 0,
    isDemo: true,
    instructor: { name: 'Teacher Eric Nshimiyimana' },
    rating: { average: 4.9, count: 51 },
    lessonsCount: 3,
  },
  {
    _id: 'demo-p6-math',
    id: 'demo-p6-math',
    title: 'Fractions, Percentages & Algebra Mastery',
    description: 'Comprehensive exam preparation: master decimals, word problems, ratios, and quick mental math strategies for national exams.',
    gradeLevel: 'Primary 6',
    category: 'mathematics',
    thumbnailEmoji: '🏆',
    price: 0,
    isDemo: true,
    instructor: { name: 'Teacher Grace Mugisha' },
    rating: { average: 5.0, count: 68 },
    lessonsCount: 4,
  },
];

export const DEMO_LESSONS_MAP = {
  'demo-p3-math': [
    {
      _id: 'demo-lesson-1',
      title: 'Chapter 1: Multiplication as Fast Adding',
      courseId: 'demo-p3-math',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      summary: `• Multiplication is simply repeated addition (e.g. 3 × 4 = 4 + 4 + 4 = 12).
• Any number multiplied by 0 always equals 0! (e.g. 99 × 0 = 0).
• Any number multiplied by 1 stays the exact same number (e.g. 7 × 1 = 7).
• The order of numbers does NOT change the answer: 4 × 5 is the same as 5 × 4 (Commutative Property).
• Quick trick for 2x table: just double the number!`,
      content: `Welcome to Multiplication Magic! In this lesson, we discover that multiplication is really just a superhero shortcut for adding the same number over and over again. When you have 3 groups of 4 bananas, you can count them one by one, or you can calculate 3 × 4 = 12!`,
      duration: '15 mins',
      hasQuiz: true,
    },
    {
      _id: 'demo-lesson-2',
      title: 'Chapter 2: 2D & 3D Shapes Around Us',
      courseId: 'demo-p3-math',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      summary: `• 2D shapes are flat: Triangles have 3 sides, Rectangles have 4 sides, and Circles have 0 corners.
• 3D shapes have depth: Spheres (like soccer balls), Cubes (like dice), and Cylinders (like drinking cans).
• A square is a special rectangle where all 4 sides are exactly equal in length.
• Look around your room: your book is a 3D cuboid, your clock might be a circle!`,
      content: `Geometry is everywhere! A flat drawing on your paper is 2-dimensional (2D), while solid toys and boxes you hold in your hands are 3-dimensional (3D).`,
      duration: '20 mins',
      hasQuiz: false,
    },
  ],
};

export const DEMO_QUIZZES_MAP = {
  'demo-lesson-1': {
    _id: 'demo-quiz-1',
    title: '🎈 Chapter 1 Quiz: Multiplication Fast Challenge',
    passingScore: 75,
    questions: [
      {
        question: 'What is 4 × 3 equal to as repeated addition?',
        options: ['4 + 3', '4 + 4 + 4', '3 + 4 + 3', '4 × 4 × 4'],
        correctAnswer: 1,
        explanation: '4 × 3 means 3 groups of 4 added together: 4 + 4 + 4 = 12.',
      },
      {
        question: 'What happens when you multiply any number by 0 (e.g., 57 × 0)?',
        options: ['It equals 57', 'It equals 1', 'It equals 0', 'It equals 10'],
        correctAnswer: 2,
        explanation: 'Any number multiplied by 0 always results in 0!',
      },
      {
        question: 'Teacher Aline has 5 baskets with 6 apples in each. How many apples in total?',
        options: ['11 apples', '30 apples', '25 apples', '36 apples'],
        correctAnswer: 1,
        explanation: '5 baskets × 6 apples each = 30 apples in total!',
      },
      {
        question: 'Is 7 × 8 the same answer as 8 × 7?',
        options: ['Yes, always!', 'No, never', 'Only in the morning', 'Only if numbers are even'],
        correctAnswer: 0,
        explanation: 'Yes! The Commutative property says switching the order does not change multiplication results: 7 × 8 = 56 and 8 × 7 = 56.',
      },
    ],
  },
};
