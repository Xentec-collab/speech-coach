import { Topic } from '../types/dispenser';

export const TOPICS: Topic[] = [
  {
    id: 'top-1',
    text: 'If I could time travel, I would...',
    category: 'what-if',
    categoryLabel: 'What If',
    timeToSpeak: 90,
    talkingPoints: [
      'Which era or decade you would visit first and why',
      'One historical event or figure you would observe',
      'The single rule you would set to avoid altering history',
    ],
  },
  {
    id: 'top-2',
    text: 'The most bizarre food I have ever eaten is...',
    category: 'story',
    categoryLabel: 'Story',
    timeToSpeak: 90,
    talkingPoints: [
      'Where you were and who convinced you to try it',
      'The texture, scent, and your raw initial reaction',
      'Whether you would ever eat it again or recommend it',
    ],
  },
  {
    id: 'top-3',
    text: 'A skill everyone should learn before turning 25 is...',
    category: 'deep',
    categoryLabel: 'Life Skill',
    timeToSpeak: 90,
    talkingPoints: [
      'Why this specific skill creates a lifelong advantage',
      'How someone can start learning it today with zero budget',
      'A personal moment where lacking or having it mattered',
    ],
  },
  {
    id: 'top-4',
    text: 'The worst advice I ever received with good intentions...',
    category: 'story',
    categoryLabel: 'Story',
    timeToSpeak: 90,
    talkingPoints: [
      'Who offered the advice and why they believed in it',
      'What happened when you followed (or almost followed) it',
      'The counter-lesson you carry forward today instead',
    ],
  },
  {
    id: 'top-5',
    text: 'If money ceased to exist tomorrow, what would your job be?',
    category: 'what-if',
    categoryLabel: 'What If',
    timeToSpeak: 90,
    talkingPoints: [
      'The craft, art, or service you would spend your days doing',
      'How your daily rhythm and stress would transform',
      'What genuine value you would contribute to your community',
    ],
  },
  {
    id: 'top-6',
    text: 'The most memorable compliment someone gave me was...',
    category: 'icebreaker',
    categoryLabel: 'Memories',
    timeToSpeak: 90,
    talkingPoints: [
      'Who said it and the surprising context around that moment',
      'Why it resonated far deeper than standard superficial praise',
      'How it permanently altered the way you view yourself',
    ],
  },
  {
    id: 'top-7',
    text: 'A harmless lie you believed for way too long as a kid...',
    category: 'icebreaker',
    categoryLabel: 'Childhood',
    timeToSpeak: 90,
    talkingPoints: [
      'Who convinced you and the funny story behind it',
      'The exact moment of disillusionment when truth was revealed',
      'A comical misunderstanding that happened while you believed it',
    ],
  },
  {
    id: 'top-8',
    text: 'If animals could talk, which one would be the rudest?',
    category: 'creative',
    categoryLabel: 'Humor',
    timeToSpeak: 90,
    talkingPoints: [
      'The creature you chose and its signature grievance',
      'What everyday human habit it would relentlessly roast',
      'How society would be forced to adapt to its commentary',
    ],
  },
  {
    id: 'top-9',
    text: 'The invention that quietly changed our daily lives forever...',
    category: 'deep',
    categoryLabel: 'Innovation',
    timeToSpeak: 90,
    talkingPoints: [
      'The unsung tool, mechanism, or standard you picked',
      'How friction-filled life was before it became ubiquitous',
      'What our daily routine would look like if it vanished tomorrow',
    ],
  },
  {
    id: 'top-10',
    text: 'A movie or book ending that made you genuinely furious...',
    category: 'story',
    categoryLabel: 'Culture',
    timeToSpeak: 90,
    talkingPoints: [
      'The title and what emotional investment was ruined',
      'The specific plot hole or unearned character turnaround',
      'How you would rewrite the final 5 minutes in your own words',
    ],
  },
  {
    id: 'top-11',
    text: 'If you had to teach a 1-hour masterclass right now with zero prep...',
    category: 'creative',
    categoryLabel: 'Mastery',
    timeToSpeak: 90,
    talkingPoints: [
      'The quirky niche passion or practical skill you would teach',
      'The first 3 actionable rules you would teach the class',
      'The biggest rookie mistake you would immediately steer them away from',
    ],
  },
  {
    id: 'top-12',
    text: 'The single habit that has improved your mental peace the most...',
    category: 'deep',
    categoryLabel: 'Wisdom',
    timeToSpeak: 90,
    talkingPoints: [
      'When and why you initially started this simple habit',
      'How it helps you quickly reset when daily anxiety strikes',
      'Your best advice for maintaining it through busy seasons',
    ],
  },
  {
    id: 'top-13',
    text: 'An unpopular opinion you will defend until your dying breath...',
    category: 'deep',
    categoryLabel: 'Hot Take',
    timeToSpeak: 90,
    talkingPoints: [
      'The controversial stance framed in one concise sentence',
      'The strongest firsthand proof or logical argument in its favor',
      'Why the popular consensus on this matter is mistaken',
    ],
  },
  {
    id: 'top-14',
    text: 'If your life had a tagline or warning label, what would it say?',
    category: 'creative',
    categoryLabel: 'Creative',
    timeToSpeak: 90,
    talkingPoints: [
      'The exact wording of the warning label or catchphrase',
      'The recurring life pattern or humorous flaw that inspired it',
      'How your closest family or friends would react seeing it',
    ],
  },
  {
    id: 'top-15',
    text: 'The moment you realized you had officially become an adult...',
    category: 'story',
    categoryLabel: 'Milestone',
    timeToSpeak: 90,
    talkingPoints: [
      'The mundane scenario where that realization hit you',
      'The funny contrast between what kid-you expected vs reality',
      'What newfound autonomy or responsibility you now appreciate',
    ],
  },
  {
    id: 'top-16',
    text: 'What is something simple that never fails to spark your curiosity?',
    category: 'deep',
    categoryLabel: 'Curiosity',
    timeToSpeak: 90,
    talkingPoints: [
      'The everyday object, natural pattern, or mystery',
      'What underlying hidden engineering or science captivates you',
      'A surprising realization you had while thinking about it',
    ],
  },
  {
    id: 'int-1',
    text: 'Should AI development be regulated globally or left to market forces?',
    category: 'cat_gdpi',
    categoryLabel: 'CAT GDPI',
    timeToSpeak: 90,
    talkingPoints: [
      'The risk of existential safety vs the danger of stifling rapid innovation',
      'Which international bodies or frameworks could realistically enforce standards',
      'Your definitive verdict on responsible balance and oversight'
    ],
  },
  {
    id: 'int-2',
    text: 'Describe a significant professional failure and what you took from it.',
    category: 'hr_interview',
    categoryLabel: 'HR Interview',
    timeToSpeak: 90,
    talkingPoints: [
      'The context of the project and the root cause of the setback',
      'Immediate steps you took to take ownership and mitigate damages',
      'The lasting systemic change or personal habit you adopted afterward'
    ],
  },
  {
    id: 'int-3',
    text: 'How do you defend technical debt refactoring to business stakeholders?',
    category: 'software_engineering',
    categoryLabel: 'Tech Behavioral',
    timeToSpeak: 90,
    talkingPoints: [
      'Translating codebase fragility into financial, velocity, or downtime risk',
      'Proposing an incremental, non-disruptive migration strategy',
      'A concrete example where proactive cleanup saved substantial engineering hours'
    ],
  },
  {
    id: 'int-4',
    text: 'Why do you believe an MBA is essential for your long-term roadmap now?',
    category: 'mba_admissions',
    categoryLabel: 'MBA Admissions',
    timeToSpeak: 90,
    talkingPoints: [
      'The gap between your current technical/operational strengths and executive goals',
      'Specific network, coursework, and strategic perspective you seek',
      'Where you expect to lead industry transformation 5 years post-graduation'
    ],
  },
  {
    id: 'int-5',
    text: 'Walk me through your most challenging collaborative project.',
    category: 'campus_placement',
    categoryLabel: 'Campus Placement',
    timeToSpeak: 90,
    talkingPoints: [
      'The core challenge, tech stack, and your distinct individual contribution',
      'How your team resolved differing technical opinions under tight deadlines',
      'Measurable outcome or feedback received upon project delivery'
    ],
  },
  {
    id: 'int-6',
    text: 'How do you maintain high team morale during high-stakes uncertainty?',
    category: 'leadership',
    categoryLabel: 'Leadership',
    timeToSpeak: 90,
    talkingPoints: [
      'Transparent communication practices that foster trust without causing panic',
      'Empowering team members with clear ownership of sub-goals',
      'A real scenario where deliberate empathy preserved project success'
    ],
  },
];

