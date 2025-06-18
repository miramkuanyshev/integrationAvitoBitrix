import Bitrix24Client from '../config/bitrix.js';
import PriceReductionCalculator from './priceHendler.js';
import TelegramNotifier from '../config/telegram.js';
import { setTimeout } from 'timers/promises';
import 'dotenv/config';

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

export default class PriceReductionManager {
  constructor(config) {
    this.config = config;
    this.bitrixClient = new Bitrix24Client(
      config.bitrix24.domain,
      config.bitrix24.userId,
      config.bitrix24.webhookCode
    );
    this.telegramNotifier = new TelegramNotifier(
      config.telegram.token,
      config.telegram.chatId
    );
    this.priceCalculator = new PriceReductionCalculator(config);
  }

  async getAllProducts() {
    let allProducts = [];
    let start = 0;
    let hasMore = true;

    const selectFields = [
      'ID',
      'NAME',
      'PRICE',
      'PROPERTY_159',
      'PROPERTY_161',
      'PROPERTY_165',
      'PROPERTY_379',
      'PROPERTY_381'
    ];

    while (hasMore) {
      const products = await this.bitrixClient.getProductsBatch(
        selectFields,
        start,
        this.config.limits.batchSize
      );

      allProducts = [...allProducts, ...products];
      hasMore = products.length === this.config.limits.batchSize;
      start += this.config.limits.batchSize;

      if (hasMore) {
        await setTimeout(this.config.limits.delayBetweenRequests);
      }
    }

    return allProducts;
  }

 async processProductPriceReduction(product) {
  console.log(`Обработка товара ${product.NAME} (ID: ${product.ID})`);

  // Проверка разрешения на понижение
  if (!product.PROPERTY_165 || product.PROPERTY_165 === 'false') {
    return { processed: false, reason: 'Понижение цены не разрешено (PROPERTY_165)' };
  }

  // Проверка наличия актуальной оценки
  if (!product.PROPERTY_159 || product.PROPERTY_159 === 'false') {
    return { processed: false, reason: 'Отсутствует актуальная оценка (PROPERTY_159)' };
  }

  const currentPrice = parseFloat(product.PRICE);
  const actualEstimate = parseFloat(product.PROPERTY_159.value);
  const estimateDate = product.PROPERTY_161.value;
  
  // Рассчитываем сколько понижений должно было произойти
  const requiredReductions = this.priceCalculator.calculateReductionsCount(estimateDate);
  const currentReductions = this.processProductPriceReduction(product)

  // Если понижений не требуется
  if (requiredReductions <= currentReductions) {
    return { 
      processed: false, 
      reason: `Не требуется понижений (текущих: ${currentReductions}, требуется: ${requiredReductions})`
    };
  }

  // Если достигнут или превышен максимум понижений
  if (requiredReductions >= this.config.reduction.maxReductions) {
    const message = `Требуется переоценка! Товар ${product.NAME} (ID: ${product.ID}) ` +
                   `превысил лимит понижений (${requiredReductions} из ${this.config.reduction.maxReductions}). ` +
                   `Текущая цена: ${currentPrice}, базовая оценка: ${actualEstimate}`;
    
    await this.telegramNotifier.sendNotification(message);
    return { 
      processed: false, 
      reason: 'Достигнут/превышен лимит понижений - требуется переоценка',
      requiresRevaluation: true
    };
  }

  // Рассчитываем новую цену с учётом всех пропущенных понижений
  const newPrice = Math.ceil(this.priceCalculator.calculateNewPrice(actualEstimate, requiredReductions));
  const nextDate = this.priceCalculator.getNextReductionDate(estimateDate, requiredReductions);

  console.log(`Текущая цена: ${currentPrice}, Новая цена: ${newPrice.toFixed(2)}`);

  // Подготовка данных для обновления
  const updateFields = {
    'PRICE': newPrice.toFixed(2),
    'PROPERTY_379': nextDate.toISOString(),
    'PROPERTY_381': requiredReductions.toString()
  };

  try {
    await this.bitrixClient.updateProduct(product.ID, updateFields);
    console.log(`Товар обновлен. Применено понижений: ${requiredReductions - currentReductions}`);

    // Если следующее понижение будет последним - уведомляем
    if (requiredReductions + 1 >= this.config.reduction.maxReductions) {
      await this.sendUpcomingLimitNotification(product, requiredReductions + 1);
    }
    
    return { 
      processed: true,
      priceChanged: (newPrice !== currentPrice),
      oldPrice: currentPrice,
      newPrice: newPrice.toFixed(2),
      reductionsApplied: (requiredReductions - currentReductions),
      totalReductions: requiredReductions,
      nextReductionDate: nextDate
    };
  } catch (error) {
    console.error(`Ошибка при обновлении товара ${product.ID}:`, error);
    return { processed: false, error: error.message };
  }
}

async sendUpcomingLimitNotification(product, nextReductionNumber) {
  const message = `⚠️ Внимание! Товар ${product.NAME} (ID: ${product.ID}) ` +
                 `при следующем понижении (${nextReductionNumber}/${this.config.reduction.maxReductions}) ` +
                 `достигнет максимального количества понижений.`;
  
  await this.telegramNotifier.sendNotification(message);
}

  async sendMaxReductionNotification(product) {
    const message = `🚨 Товар ${product.NAME} (ID: ${product.ID}) достиг максимального количества понижений цены. ` +
                   `Текущая цена: ${product.PRICE}. Последнее понижение: ${new Date().toLocaleDateString()}`;
    
    try {
      await this.telegramNotifier.sendNotification(message);
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error);
    }
  }

  async processAllProducts() {
    try {
      const products = await this.getAllProducts();
      console.log(`Всего товаров для обработки: ${products.length}`);

      let processedCount = 0;
      const results = [];

      for (const product of products) {
        const result = await this.processProductPriceReduction(product);
        results.push({ id: product.ID, ...result });
        
        if (result.processed) {
          processedCount++;
        }

        await setTimeout(this.config.limits.delayBetweenRequests);
      }

      console.log(`Обработка завершена. Обработано товаров: ${processedCount} из ${products.length}`);
      return { success: true, processed: processedCount, total: products.length, results };
    } catch (error) {
      console.error('Критическая ошибка в процессе обработки:', error);
      return { success: false, error: error.message };
    }
  }

 async processProductPriceReduction(product) {
  console.log(`Обработка товара ${product.NAME} (ID: ${product.ID})`);

  // Проверка разрешения на понижение
  if (product.PROPERTY_541 && product.PROPERTY_541.value === 173) {
    return { processed: false, reason: 'Понижение цены не разрешено (PROPERTY_541)' };
}

  // Проверка наличия актуальной оценки
  if (!product.PROPERTY_159 || product.PROPERTY_159 === 'false') {
    return { processed: false, reason: 'Отсутствует актуальная оценка (PROPERTY_159)' };
  }

  const currentPrice = parseFloat(product.PRICE);
  const actualEstimate = parseFloat(product.PROPERTY_159.value);
  const estimateDate = new Date(product.PROPERTY_161.value);
  
  // Рассчитываем количество дней с момента оценки
  const daysSinceEstimate = Math.floor((new Date() - estimateDate) / (1000 * 60 * 60 * 24));
  
  // Рассчитываем количество понижений (каждые 10 дней)
  const calculatedReductions = Math.floor(daysSinceEstimate / this.config.reduction.daysBetweenReductions);
  
  // Если понижений не требуется
  if (calculatedReductions <= 0) {
    return { 
      processed: true, 
      reason: `Не требуется понижений (прошло ${daysSinceEstimate} дней, требуется минимум ${this.config.reduction.daysBetweenReductions} дней)`
    };
  }

  // Рассчитываем новую цену с учётом всех пропущенных понижений
  const newPrice = Math.ceil(this.priceCalculator.calculateNewPrice(actualEstimate, calculatedReductions));

  // Проверяем соотношение текущей и новой цены
  if (currentPrice <= newPrice) {
    return {
      processed: true,
      reason: `Цена не требует понижения (текущая: ${currentPrice}, расчетная: ${newPrice})`,
      currentPrice,
      newPrice,
      daysSinceEstimate,
      calculatedReductions
    };
  }

  // Если достигнут или превышен максимум понижений
  if (calculatedReductions >= this.config.reduction.maxReductions) {
    const message = `Требуется переоценка! Товар ${product.NAME} (ID: ${product.ID}) ` +
                   `превысил лимит понижений (${calculatedReductions} из ${this.config.reduction.maxReductions}). ` +
                   `Текущая цена: ${currentPrice}, базовая оценка: ${actualEstimate}`;
    
    await this.telegramNotifier.sendNotification(message);
    return { 
      processed: true, 
      reason: 'Достигнут/превышен лимит понижений - требуется переоценка',
      requiresRevaluation: true
    };
  }

  const nextDate = this.priceCalculator.getNextReductionDate(estimateDate, calculatedReductions);

  console.log(`Текущая цена: ${currentPrice}, Новая цена: ${newPrice.toFixed(2)}`);
  console.log(`Прошло дней: ${daysSinceEstimate}, Понижений: ${calculatedReductions}`);

  // Подготовка данных для обновления
  const updateFields = {
    'PRICE': newPrice.toFixed(2),
  };

  try {
    await this.bitrixClient.updateProduct(product.ID, updateFields);
    console.log(`Товар обновлен. Применено понижений: ${calculatedReductions}`);

    // Если следующее понижение будет последним - уведомляем
    if (calculatedReductions + 1 >= this.config.reduction.maxReductions) {
      await this.sendUpcomingLimitNotification(product, calculatedReductions + 1);
    }
    return { 
      processed: true,
      priceChanged: true,
      oldPrice: currentPrice,
      newPrice: newPrice.toFixed(2),
      reductionsApplied: calculatedReductions,
      totalReductions: calculatedReductions,
      nextReductionDate: nextDate,
      daysSinceEstimate: daysSinceEstimate
    };
  } catch (error) {
    console.error(`Ошибка при обновлении товара ${product.ID}:`, error);
    return { processed: false, error: error.message };
  }
}
}