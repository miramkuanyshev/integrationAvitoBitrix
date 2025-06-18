import axios from 'axios';
import { setTimeout } from 'timers/promises';

export default class Bitrix24Client {
  constructor(domain, userId, webhookCode) {
    this.baseUrl = `https://${domain}/rest/${userId}/${webhookCode}/`;
  }

  // === ТОВАРЫ CRM ===

  async getProductsBatch(selectFields, start, limit) {
    try {
      const response = await axios.get(`${this.baseUrl}crm.product.list`, {
        params: {
          select: selectFields,
          order: { ID: 'ASC' },
          start: start,
          limit: limit,
        },
      });
      return response.data.result;
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      throw error;
    }
  }

  async updateProduct(productId, updateFields) {
    try {
      await axios.post(`${this.baseUrl}crm.product.update`, {
        id: productId,
        fields: updateFields,
      });
    } catch (error) {
      console.error(`Ошибка при обновлении товара ${productId}:`, error);
      throw error;
    }
  }

  // === ИНФОБЛОКИ ===

  /**
   * Получить элементы инфоблока (аналог getProductsBatch для инфоблоков)
   * @param {string} iblockTypeId — например 'lists'
   * @param {number} iblockId — ID инфоблока
   * @param {array} selectFields — поля, которые нужно получить, напр. ['ID', 'NAME', 'PROPERTY_MORE_PHOTO']
   * @param {number} start — пагинация (начальная позиция)
   * @param {number} limit — количество элементов на странице
   * @returns {Promise<array>}
   */
  async getProductListValue(propertyName, propertyValueId) {
    const url = `${this.baseUrl}/crm.product.fields.json`;

    try {
      const response = await axios.get(url, {
        validateStatus: () => true
      });

      if (response.status === 200 && response.data?.result) {
        // Ищем нужное свойство среди полей продукта
        const targetProperty = response.data.result[propertyName];

        if (!targetProperty) {
          console.error(`Свойство ${propertyName} не найдено`);
          return null;
        }

        // Ищем значение по ID в элементах списка
        const foundItem = Object.values(targetProperty.values).find(
          item => item.ID === propertyValueId
        );

        if (foundItem) {
          return foundItem.VALUE; // Возвращаем текстовое значение
        } else {
          console.error(`Значение с ID ${propertyValueId} не найдено в списке ${propertyName}`);
          return null;
        }
      } else {
        console.error('Ошибка при получении полей продукта', response.data?.error_description || response.data);
        return null;
      }
    } catch (error) {
      console.error(`Ошибка при получении значения списка:`, error.message);
      return null;
    }
  }
  /**
   * Получить URL изображений из PROPERTY_MORE_PHOTO конкретного элемента
   * @param {string} iblockTypeId — например 'lists'
   * @param {number} iblockId — ID инфоблока
   * @param {number} elementId — ID элемента
   * @returns {Promise<string[]>}
   */
  async getImgFile(fileId) {
    const url = `${this.baseUrl}/catalog.productImage.list.json`;

    try {
      const response = await axios.get(url, {
        params: { productId: fileId },
        validateStatus: () => true
      });

      if (response.status === 200 && response.data?.result) {
        return response.data.result;
      } else {
        console.error(`Ошибка для файла ${fileId}`, response.data.error_description);
        return null;
      }
    } catch (error) {
      console.error(`Ошибка при получении файла ${fileId}:`, error.message);
      return null;
    }
  }

  async findProductInBitrix(productId, bitrixConfig) {
    try {
      const response = await axios.get(bitrixConfig.apiUrl, {
        params: {
          auth: bitrixConfig.authToken,
          cmd: 'crm.product.get',
          id: productId
        }
      });
      return response.data.result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Товар не найден
      }
      console.error('Ошибка при поиске товара в Битрикс:', error);
      throw error;
    }
  }

  async updateBitrix(productId, carData, bitrixConfig) {
    try {
      // Сначала проверяем существование товара
      const existingProduct = await this.findProductInBitrix(productId, bitrixConfig);

      if (!existingProduct) {
        throw new Error(`Товар с ID ${productId} не найден в Битрикс`);
      }

      // Обновляем данные
      const response = await axios.post(bitrixConfig.apiUrl, {
        auth: bitrixConfig.authToken,
        cmd: 'crm.product.update',
        id: productId,
        fields: {
          NAME: `${carData.make.name} ${carData.model.name}`,
          PROPERTY_VALUES: {
            MAKE_ID: carData.make.id,
            MODEL_ID: carData.model.id,
            GENERATION_ID: carData.generation.id,
            MODIFICATION_ID: carData.modification.id,
            YEAR: carData.generation.name.match(/\d{4}/)?.[0] || 'Не указан',
            ENGINE_SIZE: carData.specs.engineSize,
            POWER: carData.specs.power,
            TRANSMISSION: carData.specs.transmission,
            DRIVE_TYPE: carData.specs.driveType,
            BODY_TYPE: carData.specs.bodyType,
            DOORS: carData.specs.doors
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении товара в Битрикс:', error);
      throw error;
    }
  }


}