import axios from 'axios';
import { ai21ApiKey } from './constants.js';


export const getRandomPhrase = arr => {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

export const generateFunnyHistoryQuizAI21 = async topic => {
  const apiKey = ai21ApiKey; // Получаем API-ключ из констант
  const model = 'jamba-mini-1.6'; // Или другая доступная вам модель Jurassic-2
  const prompt = `Придумай одну смешную и абсурдную викторину по всемирной истории на тему "${topic}". Викторина должна быть в формате трех вопросов и трех вариантов ответа, один из которых (укажи его как "Правильный ответ:") является исторически верным (хотя и представленным в смешном ключе), а остальные - совершенно нелепыми. В конце четко напиши "Правильный ответ: [правильный абсурдный вариант]".`;
  const maxTokens = 1048; // Примерное максимальное количество токенов в ответе
  const temperature = 0.7; // Контроль случайности (от 0 до 1)

  try {
    const response = await axios.post(
      'https://api.ai21.com/studio/v1/chat/completions',
      {
        model: model,
        messages: [{ role: 'user', content: prompt }], // Сообщения в формате чата
        n: 1, // Количество вариантов ответа
        max_tokens: maxTokens,
        temperature: temperature,
        stop: [],
        response_format: { type: 'text' }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0
    ) {
      return response.data.choices[0].message.content.trim();
    } else {
      return 'Не удалось сгенерировать смешную викторину от AI21 Labs (чат).';
    }
  } catch (error) {
    console.error('Ошибка при запросе к AI21 Labs (чат):', error);
    return 'Произошла ошибка при создании викторины от AI21 Labs (чат).';
  }
};