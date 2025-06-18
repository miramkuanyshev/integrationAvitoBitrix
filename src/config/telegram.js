import TelegramBot from 'node-telegram-bot-api';

export default class TelegramNotifier {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
  }

  async sendNotification(message) {
    try {
      await this.bot.sendMessage(this.chatId, message);
      console.log(`Уведомление отправлено: ${message}`);
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error);
      throw error;
    }
  }
}