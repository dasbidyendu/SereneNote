export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Excited';
  isPublic: boolean;
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string;
  };
};

export const journalEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'A Good Day',
    content: 'Today was a really good day. I went for a walk in the park and felt the sun on my face. It was peaceful and I felt very content.',
    mood: 'Happy',
    isPublic: true,
    createdAt: '2024-07-21T10:00:00Z',
    author: { name: 'Alex Doe', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100' },
  },
  {
    id: '2',
    title: 'Feeling a bit overwhelmed',
    content: 'Work has been stressful lately. I have a big deadline coming up and it\'s causing a lot of anxiety. Trying to remember to breathe.',
    mood: 'Anxious',
    isPublic: false,
    createdAt: '2024-07-20T15:30:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
  {
    id: '3',
    title: 'Quiet evening',
    content: 'Spent the evening reading a book with a cup of tea. It was very calming and helped me unwind after a long week.',
    mood: 'Calm',
    isPublic: true,
    createdAt: '2024-07-19T20:00:00Z',
    author: { name: 'Sam Jones', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100' },
  },
  {
    id: '4',
    title: 'Excited for the weekend',
    content: 'I\'m going on a small trip this weekend with friends. I can\'t wait to get away and have some fun. Really looking forward to it!',
    mood: 'Excited',
    isPublic: true,
    createdAt: '2024-07-18T12:00:00Z',
    author: { name: 'Chris Lee', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100' },
  },
  {
    id: '5',
    title: 'My private thoughts',
    content: 'Just needed to write some things down that I don\'t want to share. It feels good to get it out of my head and onto the page.',
    mood: 'Sad',
    isPublic: false,
    createdAt: '2024-07-17T09:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
];

export const moodChartData = [
  { date: 'Mon', mood: 4, tooltip: 'Happy' },
  { date: 'Tue', mood: 2, tooltip: 'Anxious' },
  { date: 'Wed', mood: 5, tooltip: 'Excited' },
  { date: 'Thu', mood: 3, tooltip: 'Calm' },
  { date: 'Fri', mood: 2, tooltip: 'Sad' },
  { date: 'Sat', mood: 4, tooltip: 'Happy' },
  { date: 'Sun', mood: 3, tooltip: 'Calm' },
];

export const dailyMoods = {
    '2024-07-21': { mood: 'Happy' },
    '2024-07-20': { mood: 'Anxious' },
    '2024-07-19': { mood: 'Calm' },
    '2024-07-18': { mood: 'Excited' },
    '2024-07-17': { mood: 'Sad' },
    '2024-07-15': { mood: 'Happy' },
    '2024-07-12': { mood: 'Calm' },
    '2024-07-10': { mood: 'Anxious' },
    '2024-07-05': { mood: 'Excited' },
    '2024-07-02': { mood: 'Happy' },
};
