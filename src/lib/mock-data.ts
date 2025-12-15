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
    createdAt: '2024-07-22T10:00:00Z',
    author: { name: 'Alex Doe', avatarUrl: 'https://picsum.photos/seed/avatar1/100/100' },
  },
  {
    id: '2',
    title: 'Feeling a bit overwhelmed',
    content: 'Work has been stressful lately. I have a big deadline coming up and it\'s causing a lot of anxiety. Trying to remember to breathe.',
    mood: 'Anxious',
    isPublic: false,
    createdAt: '2024-07-23T15:30:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
  {
    id: '3',
    title: 'Quiet evening',
    content: 'Spent the evening reading a book with a cup of tea. It was very calming and helped me unwind after a long week.',
    mood: 'Calm',
    isPublic: true,
    createdAt: '2024-07-24T20:00:00Z',
    author: { name: 'Sam Jones', avatarUrl: 'https://picsum.photos/seed/avatar2/100/100' },
  },
  {
    id: '4',
    title: 'Excited for the weekend',
    content: 'I\'m going on a small trip this weekend with friends. I can\'t wait to get away and have some fun. Really looking forward to it!',
    mood: 'Excited',
    isPublic: true,
    createdAt: '2024-07-25T12:00:00Z',
    author: { name: 'Chris Lee', avatarUrl: 'https://picsum.photos/seed/avatar3/100/100' },
  },
  {
    id: '5',
    title: 'My private thoughts',
    content: 'Just needed to write some things down that I don\'t want to share. It feels good to get it out of my head and onto the page.',
    mood: 'Sad',
    isPublic: false,
    createdAt: '2024-07-26T09:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
   {
    id: '6',
    title: 'A Happy Day',
    content: 'I had a wonderful time with my family today. We went to the beach and had a picnic.',
    mood: 'Happy',
    isPublic: false,
    createdAt: '2024-07-27T14:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
  {
    id: '7',
    title: 'A Calm Moment',
    content: 'Took some time to meditate this morning. It really helped center me for the day.',
    mood: 'Calm',
    isPublic: false,
    createdAt: '2024-07-28T08:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
  {
    id: '8',
    title: 'Feeling Anxious',
    content: 'I have a presentation tomorrow and I am feeling very nervous about it.',
    mood: 'Anxious',
    isPublic: false,
    createdAt: '2024-07-10T18:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
  {
    id: '9',
    title: 'Excited for my birthday',
    content: 'My birthday is coming up and I am so excited to celebrate with my friends.',
    mood: 'Excited',
    isPublic: false,
    createdAt: '2024-07-05T11:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  },
   {
    id: '10',
    title: 'Feeling Happy',
    content: 'I got a promotion at work today! I am so happy and proud of myself.',
    mood: 'Happy',
    isPublic: false,
    createdAt: '2024-07-02T16:00:00Z',
    author: { name: 'Jane Smith', avatarUrl: 'https://picsum.photos/seed/avatar_me/100/100' },
  }
];

export const moodChartData = [
  { date: 'Mon', fullDate: '2024-07-22T10:00:00Z', mood: 4, tooltip: 'Happy' },
  { date: 'Tue', fullDate: '2024-07-23T15:30:00Z', mood: 2, tooltip: 'Anxious' },
  { date: 'Wed', fullDate: '2024-07-24T20:00:00Z', mood: 5, tooltip: 'Calm' },
  { date: 'Thu', fullDate: '2024-07-25T12:00:00Z', mood: 3, tooltip: 'Excited' },
  { date: 'Fri', fullDate: '2024-07-26T09:00:00Z', mood: 2, tooltip: 'Sad' },
  { date: 'Sat', fullDate: '2024-07-27T14:00:00Z', mood: 4, tooltip: 'Happy' },
  { date: 'Sun', fullDate: '2024-07-28T08:00:00Z', mood: 3, tooltip: 'Calm' },
];
