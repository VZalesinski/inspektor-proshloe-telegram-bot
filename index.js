import { Telegraf } from 'telegraf';
import { generateFunnyHistoryQuizAI21, getRandomPhrase } from './utils.js';
import {
  answerProbability,
  phrasesList,
  token,
  cacheLimit,
  defaultSubreddit,
  sentMemesCache,
} from './constants.js';
import axios from 'axios';

const bot = new Telegraf(token, { polling: true });

bot.command('start', async ctx => {
  await ctx.reply('Привет! Я бот для группового чата.');
});

bot.command('quiz', async ctx => {
  const topic = ctx.message.text.substring('/quiz '.length).trim();

  if (!topic) {
    await ctx.reply(
      'Пожалуйста, укажите тему викторины после команды /quiz. Например: /quiz Древний Рим'
    );
    return;
  }

  await ctx.reply('Генерирую смешную викторину...');
  const quiz = await generateFunnyHistoryQuizAI21(topic);
  await ctx.reply(quiz);
});

bot.command('meme', async ctx => {

  try {
    const response = await axios.get(
      `https://meme-api.com/gimme/${encodeURIComponent(defaultSubreddit)}`
    );

    if (response.data && response.data.url) {
      const memeUrl = response.data.url;

      if (sentMemesCache.has(memeUrl)) {
        await ctx.reply(
          'Этот мем уже был отправлен недавно. Попробуем еще раз...'
        );

        return ctx.telegram
          .sendChatAction(ctx.chat.id, 'upload_photo')
          .then(() => bot.handleUpdate(ctx.update));
      }

      await ctx.sendPhoto(memeUrl);
      sentMemesCache.add(memeUrl);

      // Поддерживаем размер кэша
      if (sentMemesCache.size > cacheLimit) {
        const oldestMeme = sentMemesCache.values().next().value;
        sentMemesCache.delete(oldestMeme);
      }
    } else {
      await ctx.reply(
        `Не удалось найти мемы по запросу или в сабреддите: "${subreddit}"`
      );
    }
  } catch (error) {
    await ctx.reply('Не удалось получить исторический мем. Попробуйте позже.');
  }
});

bot.on('text', async ctx => {
  const receivedText = ctx.message.text;

  if (receivedText && Math.random() < answerProbability) {
    await ctx.reply(getRandomPhrase(phrasesList));
  }
});

bot.on('new_chat_members', async ctx => {
  const newMembers = ctx.message.new_chat_members;

  for (const member of newMembers) {
    await ctx.reply(`Добро пожаловать в чат, ${member.first_name}!`);
  }
});

bot.on('left_chat_member', async ctx => {
  const leftMember = ctx.message.left_chat_member;
  await ctx.reply(`${leftMember.first_name} покинул чат.`);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
