import 'dotenv/config';

export const token = process.env.TOKEN;
export const ai21ApiKey = '02af2338-82a6-4df2-a370-1844be45b137';

export const phrasesList = [
  'Безобразие.',
  'Ужас! Какая красота!',
  'Любо глядеть.',
  'Друзья мои!',
  'Друзья мои! Это безобразие!',
  'слов нет, одни эмоции.',
  'Раньше…люди были черные как черти.',
  'не тратьте мое драгоценное время.',
  'ну просто любо глядеть!',
  'блесните умом.',
  'не выдумывайте, не придумывайте!',
  '*все что угодно* на небосклоне нашей гимназии.',
  'поставь себе 2. безобразие.',
  'ну просто тьмутаракань!'
];

export const answerProbability = 0.3;

export const sentMemesCache = new Set();
export const cacheLimit = 20;
export const defaultSubreddit = 'HistoryMemes';
