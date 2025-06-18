import {
  B24Hook,
  LoggerBrowser,
  Result
} from '@bitrix24/b24jssdk';

const $logger = LoggerBrowser.build('BitrixImageService', import.meta.env?.DEV === true);

export default class BitrixImageService {
  constructor(b24Url, userId, secret) {
    this.domain = new URL(b24Url).hostname;
    this.$b24 = new B24Hook({
      b24Url,
      userId,
      secret
    });
  }

  /**
   * Скачивает изображения товара из указанного поля
   * @param {Object} product - Объект товара
   * @param {string} imageField - Название поля с изображениями (например "PROPERTY_45")
   * @param {number} [limit=5] - Максимальное количество изображений
   * @returns {Promise<Array<{buffer: Buffer, fileName: string, fileType: string}>>}
   */
  async downloadProductImages(product, imageField = 'PROPERTY_45', limit = 5) {
    if (!product || !product.ID) {
      $logger.warn('Неверный объект товара');
      return [];
    }

    const files = product[imageField] || [];
    
    if (!Array.isArray(files)) {
      $logger.warn(`У товара ${product.ID} поле ${imageField} не является массивом`);
      return [];
    }

    if (files.length === 0) {
      $logger.warn(`У товара ${product.ID} нет изображений в поле ${imageField}`);
      return [];
    }

    const downloadedImages = [];
    
    for (const fileObj of files.slice(0, limit)) {
      try {
        const fileData = fileObj.value || {};
        const downloadUrl = fileData.downloadUrl;
        
        if (!downloadUrl) {
          $logger.warn(`У файла в товаре ${product.ID} отсутствует downloadUrl`);
          continue;
        }

        const fullUrl = this._normalizeUrl(downloadUrl);
        const fileInfo = await this._downloadFile(fullUrl);
        
        if (fileInfo) {
          downloadedImages.push({
            buffer: fileInfo.buffer,
            fileName: `product_${product.ID}_${fileData.id || Date.now()}.${fileInfo.fileType}`,
            fileType: fileInfo.fileType
          });
        }
      } catch (error) {
        $logger.error(`Ошибка при скачивании файла для товара ${product.ID}:`, error);
      }
    }
    console.log(downloadedImages)
    return downloadedImages;
  }

  async _downloadFile(url) {
    try {
      // Получаем информацию о файле
      const fileInfo = await this.$b24.callMethod(
    'catalog.productImage.get', 
    {
        productId: 849,
        id: 15171,
    }, 
    function(result)
    {
        if(result.error())
            console.error(result.error());
        else
            console.log(result.data());
    }
);
      console.log(fileInfo)

      const result = new Result(fileInfo);
      const fileData = result.getData();
      
      if (!fileData.downloadUrl) {
        throw new Error('Не удалось получить URL для скачивания');
      }

      // Скачиваем файл
      const response = await fetch(fileData.downloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const fileType = this._detectFileType(response.headers.get('content-type'), fileData.name);

      return {
        buffer: Buffer.from(buffer),
        fileType
      };
    } catch (error) {
      $logger.error('Ошибка скачивания файла:', error);
      return null;
    }
  }

  _normalizeUrl(url) {
    return url.startsWith('http') ? url : `https://${this.domain}${url}`;
  }

  _detectFileType(contentType, fileName) {
    if (contentType && contentType.startsWith('image/')) {
      return contentType.split('/')[1];
    }
    
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ext || 'jpg'; // fallback
  }
}