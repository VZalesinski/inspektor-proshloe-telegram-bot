import { Telegraf } from 'telegraf';
import express from 'express';
import { generateFunnyHistoryQuizAI21, getRandomPhrase } from './utils.js';
import {
  answerProbability,
  phrasesList,
  token,
  cacheLimit,
  defaultSubreddit,
  sentMemesCache
} from './constants.js';
import axios from 'axios';

const app = express();
const bot = new Telegraf(token);

bot.command('start', async ctx => {
  console.log('command start');

  await ctx.reply('Привет! Я бот для группового чата.');
});

bot.command('quiz', async ctx => {
  console.log('command quiz');

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
  console.log('command meme');
  try {
    const response = await axios.get(
      `https://meme-api.com/gimme/${encodeURIComponent(defaultSubreddit)}`,
      { timeout: 30000 }
    );

    if (response.data && response.data.url) {
      const memeUrl = response.data.url;

      if (sentMemesCache.has(memeUrl)) {
        await ctx.reply(
          'Этот мем уже был отправлен недавно. Попробуем еще раз...'
        );

        return ctx.telegram
          .sendChatAction(ctx.chat.id, 'upload_photo')
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
        `Не удалось найти мемы по запросу или в сабреддите: "${defaultSubreddit}"`
      );
    }
  } catch (error) {
    console.error('Ошибка при обработке команды /meme:', error);
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      await ctx.reply(
        'Не удалось получить мем за отведенное время. Попробуйте позже.'
      );
    } else {
      await ctx.reply('Произошла ошибка при получении мема. Попробуйте позже.');
    }
  }
});

bot.on('text', async ctx => {
  const receivedText = ctx.message.text;

  console.log('command text')
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

// Обработка входящих обновлений от Telegram через вебхук
app.use(express.json());
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

// Запуск сервера и установка вебхука
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Сервер запущен на порту ${port}`);
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const wasSet = await bot.telegram.setWebhook(webhookUrl + '/webhook');
      if (wasSet) {
        console.log('Вебхук успешно установлен!');
      } else {
        console.log('Не удалось установить вебхук.');
      }
    } catch (err) {
      console.error('Ошибка при установке вебхука:', err);
    }
  } else {
    console.log('Переменная окружения WEBHOOK_URL не установлена.');
  }
});

// Больше не вызывайте bot.launch() при использовании вебхуков
// bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
