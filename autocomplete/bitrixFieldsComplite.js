import xml2js from 'xml2js';
import { promises as fs } from 'fs';

export default class CarDataProcessor {
    constructor(xmlFilePath) {
        this.xmlFilePath = xmlFilePath;
        this.parser = new xml2js.Parser();
    }

    async loadXmlData() {
        try {
            const xmlData = await fs.readFile(this.xmlFilePath, 'utf-8');
            return xmlData;
        } catch (error) {
            console.error('Ошибка при чтении XML файла:', error);
            throw error;
        }
    }


    async findCarByName(makeName, modelName, generationName, modificationName, productionYear) {
        try {
            const xmlData = await this.loadXmlData();
            const result = await this.parser.parseStringPromise(xmlData);

            if (!result.Catalog || !result.Catalog.Make) {
                throw new Error('Неверная структура XML: отсутствует Catalog/Make');
            }

            // Обрабатываем марки
            const makes = Array.isArray(result.Catalog.Make)
                ? result.Catalog.Make
                : [result.Catalog.Make];

            const make = makes.find(m => m.$.name === makeName);
            if (!make) throw new Error(`Марка ${makeName} не найдена`);
            if (!make.Model) throw new Error(`У марки ${makeName} не найдено моделей`);

            // Обрабатываем модели
            const models = Array.isArray(make.Model)
                ? make.Model
                : [make.Model];

            const model = models.find(m => m.$.name === modelName);
            if (!model) throw new Error(`Модель ${modelName} не найдена у марки ${makeName}`);
            if (!model.Generation) throw new Error(`У модели ${modelName} не найдено поколений`);

            // Обрабатываем поколения
            const generations = Array.isArray(model.Generation)
                ? model.Generation
                : [model.Generation];

            // Ищем конкретное поколение
            const generation = generations.find(g => g.$.name === generationName);
            if (!generation) {
                throw new Error(`Поколение ${generationName} не найдено у модели ${modelName}`);
            }

            if (!generation.Modification) {
                throw new Error(`У поколения ${generationName} не найдено модификаций`);
            }

            // Ищем модификацию
            const modifications = Array.isArray(generation.Modification)
                ? generation.Modification
                : [generation.Modification];

            const modification = modifications.find(m =>
                m.$.name === modificationName ||
                m.Modification === modificationName
            );

            if (!modification) {
                throw new Error(`Модификация ${modificationName} не найдена в поколении ${generationName}`);
            }

            // Возвращаем найденные данные
            return {
                'PROPERTY_113': modification.FuelType?.[0]?._,
                'PROPERTY_413': modification.DriveType?.[0]?._,
                'PROPERTY_115': modification.Transmission?.[0]?._,
                'PROPERTY_135': modification.Power?.[0]?._,
                'PROPERTY_133': modification.EngineSize?.[0]?._,
                'PROPERTY_411': modification.BodyType?.[0]?._,
                'PROPERTY_403': modification.Doors?.[0]?._
            };

        } catch (error) {
            console.error('Ошибка при поиске автомобиля:', error.message);
            throw error;
        }
    }

}