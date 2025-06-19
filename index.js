import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import AvitoXmlGenerator from './src/hendler/avitoExports.js';
import Bitrix24Client from './src/config/bitrix.js';
import PriceReductionManager from './src/hendler/priceApp.js';
import cron from 'node-cron';
import TelegramNotifier from './src/config/telegram.js';

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация
const config = {
  bitrix24: {
    domain: process.env.BITRIX_API_URL,
    userId: process.env.BITRIX_USER_ID,
    webhookCode: process.env.BITRIX_WEBHOOK_TOKEN
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  limits: {
    batchSize: 50,
    delayBetweenRequests: 1000
  },
  reduction: {
    initialPercent: 3,
    finalPercent: 2,
    maxReductions: 7,
    daysBetweenReductions: 10
  }
};

// Инициализация клиентов
const bitrixClient = new Bitrix24Client(
  config.bitrix24.domain,
  config.bitrix24.userId,
  config.bitrix24.webhookCode
);
const avitoGenerator = new AvitoXmlGenerator(bitrixClient);
const priceManager = new PriceReductionManager(config);
const telegramNotifier = new TelegramNotifier(
  config.telegram.token,
  config.telegram.chatId
);

// Путь к XML файлу
const XML_FILE_PATH = path.join(process.cwd(), 'avito_export.xml');

// Middleware для логов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Роут для получения XML
app.get('/avito.xml', (req, res) => {
  try {
    if (fs.existsSync(XML_FILE_PATH)) {
      res.set('Content-Type', 'application/xml');
      res.sendFile(XML_FILE_PATH);
    } else {
      res.status(404).send('XML file not found');
    }
  } catch (error) {
    console.error('Error serving XML file:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Функция выгрузки в Avito
async function runAvitoExport() {
  try {
    console.log('Запуск выгрузки в Avito...');
    const xml = await avitoGenerator.generateAvitoXml();
    await avitoGenerator.saveXml(xml, XML_FILE_PATH);
    console.log('Выгрузка в Avito завершена успешно');
    return { success: true };
  } catch (error) {
    console.error('Ошибка выгрузки в Avito:', error);
    await telegramNotifier.sendNotification(`❌ Ошибка выгрузки в Avito: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Функция понижения цен (ваша версия с улучшениями)
async function runPriceReduction() {
  try {
    console.log('Запуск скрипта понижения цен...');
    const startTime = new Date();
    
    const result = await priceManager.processAllProducts();
    
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    // Собираем статистику
    const stats = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${duration} сек`,
      totalProducts: result.total || 0,
      processedProducts: result.processed || 0,
      priceReductionsApplied: 0,
      lastReductions: 0,
      skippedDueToPrice: 0,
      skippedDueToLimit: 0,
      errors: 0
    };

    // Анализируем результаты
    if (result.results && Array.isArray(result.results)) {
      result.results.forEach(item => {
        if (item.processed) {
          stats.priceReductionsApplied++;
          if (item.totalReductions + 1 >= config.reduction.maxReductions) {
            stats.lastReductions++;
          }
        } else if (item.reason?.includes('Цена не требует понижения')) {
          stats.skippedDueToPrice++;
        } else if (item.reason?.includes('Достигнут/превышен лимит')) {
          stats.skippedDueToLimit++;
        } else if (item.error) {
          stats.errors++;
        }
      });
    }

    // Формируем отчет
    const report = `
📊 Отчет по выполнению скрипта понижения цен
⏱ Время начала: ${stats.startTime}
⏱ Время окончания: ${stats.endTime}
⏱ Длительность: ${stats.duration}

📦 Всего товаров: ${stats.totalProducts}
✅ Обработано товаров: ${stats.processedProducts}
🔽 Применено понижений: ${stats.priceReductionsApplied}
⚠️ Последние понижения: ${stats.lastReductions}

⏭ Пропущено (цена уже актуальна): ${stats.skippedDueToPrice}
🚫 Пропущено (достигнут лимит): ${stats.skippedDueToLimit}
❌ Ошибок обработки: ${stats.errors}
    `;

    console.log(result);
    
    return {
      success: true,
      stats: stats,
      details: result
    };
  } catch (error) {
    const errorMessage = `❌ Критическая ошибка в скрипте понижения цен: ${error.message}`;
    console.error(errorMessage);
    await telegramNotifier.sendNotification(errorMessage);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Настройка cron-задач
function setupCronJobs() {
  // Выгрузка в Avito каждые 30 минут
  cron.schedule('*/30 * * * *', async () => {
    await runAvitoExport();
  });

  // Понижение цен каждый день в 00:10
  cron.schedule('10 0 * * *', async () => {
    await runPriceReduction();
  });

  console.log('Cron jobs настроены');
}

// Запуск сервера и инициализация
(async () => {
  try {
    // Настройка cron
    setupCronJobs();

    await runPriceReduction();
    await runAvitoExport();

    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`XML файл доступен по адресу: http://ваш-домен:${PORT}/avito.xml`);
    });

    // Первоначальная выгрузка при старте

  } catch (error) {
    console.error('Ошибка при запуске приложения:', error);
    process.exit(1);
  }
})();