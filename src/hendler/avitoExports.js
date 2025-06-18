import { Builder } from 'xml2js';
import { setTimeout } from 'timers/promises';
import { promises as fs } from 'fs';
import CarDataProcessor from '../../autocomplete/bitrixFieldsComplite.js';
import SECTION_MAPPING from '../mapping/avitoMapping.js';

export default class AvitoXmlGenerator {
  constructor(bitrixClient) {
    this.bitrixClient = bitrixClient;
    this.builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
      cdata: true
    });
  }

  /**
   * Основной метод выгрузки
   */
  async generateAvitoXml() {
    try {
      console.log('🔄 Начинаем выгрузку товаров из Битрикс24...');
      const products = await this.getAllProducts();
      console.log(`✅ Получено ${products.length} товаров`);
      console.log(`Обновляю строки в соответствии с Авито`);
      const avitoAds = await this.convertProductsToAvito(products);
      console.log(`✅ Сформировано ${avitoAds.length} объявлений для Авито`);

      const xml = this.buildXml(avitoAds);
      return xml;
    } catch (error) {
      console.error('❌ Ошибка генерации XML:', error.message);
      throw error;
    }
  }

  /**
   * Получает все товары из Битрикс24 с пагинацией
   */
  async getAllProducts() {
    const selectFields = this.getRequiredFields();
    let allProducts = [];
    let start = 0;
    const limit = 50;

    do {
      const products = await this.bitrixClient.getProductsBatch(selectFields, start, limit);
      allProducts = [...allProducts, ...products];
      start += limit;

      if (products.length === limit) {
        await setTimeout(1000); // Задержка между запросами
      }
    } while (allProducts.length % limit === 0 && allProducts.length > 0);

    return allProducts;
  }

  /**
   * Возвращает список полей для выборки
   */
  getRequiredFields() {
    const baseFields = ['ID', 'NAME', 'PRICE', 'SECTION_ID', 'DESCRIPTION', 'PROPERTY_%', 'PROPERTY_415', 'PROPERTY_385', 'PROPERTY_117', 'PROPERTY_425'];
    const specificFields = [];

    for (const section of Object.values(SECTION_MAPPING)) {
      for (const bitrixField of Object.keys(section.fields)) {
        if (!specificFields.includes(bitrixField)) {
          specificFields.push(bitrixField);
        }
      }
    }

    return [...baseFields, ...specificFields];
  }

  /**
   * Конвертирует товары Bitrix24 в объявления Avito
   */
  async convertProductsToAvito(products) {
    const convertedProducts = [];

    for (const product of products) {
      try {
        const sectionId = product.SECTION_ID;
        const mapping = SECTION_MAPPING[sectionId];
        if (!mapping) {
          console.warn(`⚠️ Неизвестный раздел ${sectionId} для товара ${product.ID}`);
          continue;
        }

        const convertedProduct = await this.convertProduct(product, mapping);
        if (convertedProduct) {
          convertedProducts.push(convertedProduct);
        }
      } catch (error) {
        console.error(`Ошибка при конвертации товара ${product.ID}:`, error);
      }
    }

    return convertedProducts;
  }

  /**
   * Конвертирует один товар в формат Avito
   */
  async convertProduct(product, mapping) {
    try {
      let images;
      if (product.PROPERTY_425.value) {
        images = await this.getImagesFromString(product.PROPERTY_425.value);
      } else {
        images = await this.getImages(product);
      }

      // Базовые поля объявления
      const ad = {
        Id: product.PROPERTY_165?.value ?? product.ID,
        Title: product.NAME,
        Price: Math.ceil(parseFloat(product.PRICE)),
        Images: images,
        CurrencyPrice: Math.ceil(parseFloat(product.PRICE)),
        Description: product.DESCRIPTION,
        Address: product.PROPERTY_117?.value,
        ...mapping.defaults // Добавляем дефолтные значения для категории
      };

      // Маппинг свойств
      for (const [bitrixField, avitoField] of Object.entries(mapping.fields)) {
        const value = product[bitrixField];
        if (!value) continue;

        // Специальная обработка некоторых полей
        if (Array.isArray(value)) {
          ad[avitoField] = value.map(item => item.value || item).filter(Boolean);
        } else if (typeof value === 'object' && value.value !== undefined) {
          ad[avitoField] = value.value;
        } else {
          ad[avitoField] = value;
        }
      }

      // Проверка обязательных полей
      const missingFields = mapping.requiredFields.filter(field => !ad[field]);
      if (missingFields.length > 0) {
        console.warn(`⚠️ Товар ${product.ID} пропущен — отсутствуют обязательные поля: ${missingFields.join(', ')}`);
        return null;
      }

      return ad;
    } catch (error) {
      console.error(`Ошибка при конвертации товара ${product.ID}:`, error);
      return null;
    }
  }

  /**
   * Формирует блок с изображениями
   */

  /**
   * Получает CDN-ссылки на изображения товара
   * @param {Object} product — объект товара из crm.product.get/list
   * @returns {Promise<{ Image: Array<{ $: { url: string }} > }>}
   */

  async getImages(product) {
    try {
      const files = await this.bitrixClient.getImgFile(product.ID);
      const cdnImages = files.productImages?.map(image => image.detailUrl) || [];

      if (cdnImages.length === 0) {
        console.warn(`❌ У товара ${product.ID} нет изображений`);
        return { Image: [] };
      }

      return {
        Image: cdnImages.slice(0, 20).map(url => ({
          $: { url }
        }))
      };
    } catch (error) {
      console.error(`Ошибка при получении изображений для товара ${product.ID}:`, error);
      return { Image: [] };
    }
  }

  async getImagesFromString(imagesString) {
    try {
        // Проверяем, есть ли строка с изображениями
        if (!imagesString || typeof imagesString !== 'string') {
            console.warn('❌ Передана пустая или невалидная строка с изображениями');
            return { Image: [] };
        }

        // Разбиваем строку по разделителю `|` и убираем пробелы
        const urls = imagesString
            .split('|')
            .map(url => url.trim())
            .filter(url => url !== ''); // Удаляем пустые строки

        if (urls.length === 0) {
            console.warn('❌ Нет валидных URL в строке');
            return { Image: [] };
        }

        // Формируем XML-совместимый объект (первые 20 изображений)
        return {
            Image: urls.slice(0, 20).map(url => ({
                $: { url }
            }))
        };
    } catch (error) {
        console.error('Ошибка при обработке строки изображений:', error);
        return { Image: [] };
    }
}

  /**
   * Генерирует итоговый XML
   */
  buildXml(ads) {
    const xmlObject = {
      Ads: {
        $: {
          formatVersion: '3',
          target: 'Avito.ru'
        },
        Ad: ads
      }
    };

    return this.builder.buildObject(xmlObject);
  }

  /**
   * Сохраняет XML в файл
   */
  async saveXml(xml, filename = 'avito_export.xml') {
    try {
      await fs.writeFile(filename, xml);
      console.log(`✅ Файл ${filename} успешно сохранён`);
    } catch (e) {
      console.error(`❌ Ошибка сохранения файла: ${e.message}`);
      throw e;
    }
  }
}