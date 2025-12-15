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

export const moodChartData = [
  { date: 'Mon', fullDate: '2024-07-22T10:00:00Z', mood: 4, tooltip: 'Happy' },
  { date: 'Tue', fullDate: '2024-07-23T15:30:00Z', mood: 2, tooltip: 'Anxious' },
  { date: 'Wed', fullDate: '2024-07-24T20:00:00Z', mood: 5, tooltip: 'Calm' },
  { date: 'Thu', fullDate: '2024-07-25T12:00:00Z', mood: 3, tooltip: 'Excited' },
  { date: 'Fri', fullDate: '2024-07-26T09:00:00Z', mood: 2, tooltip: 'Sad' },
  { date: 'Sat', fullDate: '2024-07-27T14:00:00Z', mood: 4, tooltip: 'Happy' },
  { date: 'Sun', fullDate: '2024-07-28T08:00:00Z', mood: 3, tooltip: 'Calm' },
];
