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
      chapter: 1,
      title: 'Multiplication as Fast Adding',
      courseId: 'demo-p3-math',
      readingTime: 4,
      wordCount: 320,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      learningObjectives: [
        'Explain why multiplication is a superhero shortcut for repeated addition.',
        'Master the Zero Rule (anything × 0 = 0) and Identity Rule (anything × 1 = itself).',
        'Use the Commutative Property to multiply numbers in any order (4 × 5 = 5 × 4).',
        'Solve everyday shopping and sharing word problems using times tables.'
      ],
      studyNotes: {
        overview: 'Multiplication is a fast, fun way to add equal groups together! When you have 3 bags with 4 juicy oranges each, you can calculate 3 × 4 = 12 in one second instead of counting one by one.',
        keyPoints: [
          'Multiplication is repeated addition: 3 × 4 = 4 + 4 + 4 = 12.',
          'Zero Rule: Any number multiplied by 0 always equals 0 (e.g. 99 × 0 = 0).',
          'Identity Rule: Any number multiplied by 1 stays unchanged (e.g. 7 × 1 = 7).',
          'Commutative Law: Switching the order gives the exact same result: 4 × 5 = 5 × 4 = 20.',
          'Quick 2x Table Shortcut: Just double the number! (6 × 2 = 6 + 6 = 12).'
        ],
        keyFacts: [
          '4 × 5 = 5 × 4 (Order does not matter)',
          'Any number × 0 = 0',
          'Any number × 1 = itself',
          'Even numbers end in 0, 2, 4, 6, 8'
        ],
        vocabulary: [
          { term: 'Factor', definition: 'The numbers you multiply together (e.g. in 3 × 4 = 12, 3 and 4 are factors).' },
          { term: 'Product', definition: 'The final answer in a multiplication problem (e.g. 12 is the product).' },
          { term: 'Repeated Addition', definition: 'Adding the exact same number multiple times in a row.' },
          { term: 'Commutative Property', definition: 'The math rule that says switching order does not change the answer.' }
        ]
      },
      flashcards: [
        { front: 'What is 4 × 3 as repeated addition?', back: '4 + 4 + 4 = 12! 🎈', hint: 'Add 4 three times' },
        { front: 'What is 999 × 0?', back: '0! Any number multiplied by zero always becomes 0.', hint: 'Remember the Zero Rule' },
        { front: 'What is 7 × 8?', back: '56! 🏆 (Fun rhyme: 5, 6, 7, 8 -> 56 = 7 × 8)', hint: 'Count by 7s or 8s' },
        { front: 'What do we call the final answer in multiplication?', back: 'The Product! ⭐', hint: 'Starts with letter P' }
      ],
      scenarioChallenge: {
        title: 'Market Day in Kimironko 🛒',
        story: 'Keza has 2,000 RWF for school supplies and snacks. At the market, she wants to buy 4 notebooks that cost 400 RWF each. How much will all 4 notebooks cost, and will she have enough money left to buy a 200 RWF fruit juice?',
        question: 'What is the total cost of 4 notebooks at 400 RWF each?',
        options: [
          '1,200 RWF (She has 800 RWF left — yes, she can buy the juice!)',
          '1,600 RWF (She has 400 RWF left — yes, she can buy the juice!)',
          '2,400 RWF (She does not have enough money)',
          '800 RWF (She can buy two juices)'
        ],
        correctAnswer: 1,
        explanation: '4 notebooks × 400 RWF = 1,600 RWF. Since Keza started with 2,000 RWF, she has 2,000 - 1,600 = 400 RWF left! That is plenty to buy her 200 RWF fruit juice. Great math! 📓🧃'
      },
      hasQuiz: true,
    },
    {
      _id: 'demo-lesson-2',
      chapter: 2,
      title: '2D & 3D Shapes Around Us',
      courseId: 'demo-p3-math',
      readingTime: 5,
      wordCount: 350,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      learningObjectives: [
        'Distinguish between flat 2D shapes (length and width) and solid 3D objects (depth).',
        'Count sides, corners (vertices), and faces on everyday geometrical shapes.',
        'Identify 3D objects at home and in Rwanda (cubes, spheres, cylinders).'
      ],
      studyNotes: {
        overview: 'Shapes are everywhere around us! Flat shapes drawn on paper are 2D (like squares and triangles), while real-world objects you can pick up and hold are 3D (like balls, boxes, and water bottles).',
        keyPoints: [
          '2D shapes are flat: Triangles have 3 sides, Rectangles have 4 sides, and Circles have 0 corners.',
          '3D shapes have solid depth: Spheres (soccer balls), Cubes (dice), and Cylinders (drinking cans).',
          'A square is a special rectangle where all 4 sides are exactly equal in length.',
          'Faces are the flat surfaces of a 3D shape, and edges are where two faces meet.'
        ],
        keyFacts: [
          'Triangle: 3 sides & 3 corners',
          'Square: 4 equal sides & 4 corners',
          'Sphere: 1 curved surface & 0 corners',
          'Cube: 6 equal square faces & 8 corners'
        ],
        vocabulary: [
          { term: '2D Shape', definition: 'A flat shape with only two dimensions: length and width.' },
          { term: '3D Shape', definition: 'A solid shape with three dimensions: length, width, and depth.' },
          { term: 'Vertex (Corner)', definition: 'The sharp point where two or more lines meet.' },
          { term: 'Face', definition: 'The flat or curved surface of a 3-dimensional object.' }
        ]
      },
      flashcards: [
        { front: 'How many sides does a triangle have?', back: '3 sides and 3 corners (vertices)! 📐', hint: 'Tri means three' },
        { front: 'What 3D shape is a soccer ball?', back: 'A Sphere! ⚽', hint: 'It rolls smoothly in all directions' },
        { front: 'What 3D shape is a soda can?', back: 'A Cylinder! 🥫 (Two circular flat faces and one curved body)', hint: 'Round top and bottom' },
        { front: 'How many square faces does a cube have?', back: '6 square faces! (Like rolling a 6-sided die) 🎲', hint: 'Think of a dice' }
      ],
      scenarioChallenge: {
        title: 'Building a Toy Castle 🏰',
        story: 'Jean Claude is building a toy tower in his classroom. He needs a shape that can roll easily down a ramp, and another shape that can stack flat on top of a table without falling.',
        question: 'Which shapes should Jean Claude choose for rolling and stacking?',
        options: [
          'Roll a cube, stack a sphere',
          'Roll a sphere (ball), stack a cube (box)',
          'Roll a triangle, stack a circle',
          'Roll a cone, stack a pyramid'
        ],
        correctAnswer: 1,
        explanation: 'A sphere is round with no flat sides so it rolls smoothly down a ramp! A cube has 6 flat faces, making it steady and perfect for stacking towers without tumbling over. ⚽📦'
      },
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
