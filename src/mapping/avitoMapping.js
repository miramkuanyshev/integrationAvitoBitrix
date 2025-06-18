// Базовые поля, которые есть у всех объявлений
const COMMON_FIELDS = {
  // Общие для всех товаров
  'PROPERTY_129': 'Year',
  'PROPERTY_419': 'Managername',
  'PROPERTY_421': 'Contactphone',
  'PROPERTY_423': 'Contactmethod',
};

let companyname = 'АО РЕАЛИСТ БАНК',
  avitostatus = 'Активно',
  ListingFee = 'Package';


// Поля, специфичные для категорий
const CATEGORY_SPECIFIC = {
  // Легковые автомобили
  '93': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_441': 'ModificationId',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_449': 'EngineSize',
      'PROPERTY_431': 'Color',
      'PROPERTY_433': 'Accident',
      'PROPERTY_439': 'GenerationId',
      'PROPERTY_443': 'ComplectationId',
      'PROPERTY_445': 'FuelType',
      'PROPERTY_447': 'Transmission',
      'PROPERTY_455': 'WheelType',
      'PROPERTY_111': 'VIN',
      'PROPERTY_461': 'Owners',
      'PROPERTY_453': 'BodyType',
      'PROPERTY_451': 'Doors',
      'PROPERTY_467': 'PTS',
      'PROPERTY_165': 'AvitoId',

    },
    requiredFields: ['Make', 'Model', 'Year', 'Kilometrage', 'Color', 'Accident'],
    defaults: {

      Category: 'Автомобили',
      CarType: 'С пробегом',
      AdType: 'Продаю личный автомобиль',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },

  // Седельные тягачи
  '95': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_449': 'EngineSize',
      'PROPERTY_457': 'Power',
      'PROPERTY_445': 'EngineType',
      'PROPERTY_447': 'Transmission',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_475': 'WheelFormula',
      'PROPERTY_499': 'EngineCapacity',
      'PROPERTY_477': 'EmissionClass',
      'PROPERTY_479': 'CabinType',
      'PROPERTY_481': 'CabinSuspension',
      'PROPERTY_483': 'RearSuspension',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model', 'Year'],
    defaults: {
      Category: 'Грузовики и спецтехника',
      GoodsType: 'Седельные тягачи',
      BodyType: 'Седельный',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '103': {
    fields: {
      'PROPERTY_457': 'Power',
      'PROPERTY_445': 'EngineType',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_449': 'EngineCapacity',
      'PROPERTY_453': 'TypeOfVehicle',
      'PROPERTY_457': 'Power',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: [],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Другое',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '97': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'EngineHours',
      'PROPERTY_453': 'TypeOfVehicle',
      'PROPERTY_457': 'PowerKW',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: [],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Строительная техника',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '99': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'EngineHours',
      'PROPERTY_453': 'TypeOfVehicle',
      'PROPERTY_457': 'PowerKW',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_487': 'LoaderLoadCapacity',
      'PROPERTY_489': 'LoaderBucketVolume',
      'PROPERTY_491': 'LoaderBucketControlType',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Другие фронтальные погрузчики',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '101': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_453': 'TypeOfVehicle',
      'PROPERTY_493': 'TypeOfTrailer',
      'PROPERTY_495': 'Axles',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_497': 'SuspensionChassis',
      'PROPERTY_499': 'Brakes',
      'PROPERTY_501': 'GrossVehicleWeight',
      'PROPERTY_503': 'TrailerLength',
      'PROPERTY_505': 'TrailerVolume',
      'PROPERTY_165': 'AvitoId',

    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Прицепы',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '113': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_457': 'PowerKW',
      'PROPERTY_525': 'OperatingWeight',
      'PROPERTY_527': 'ShirinaGusenichnojLenty',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_529': 'ExcavatorBucketVolume',
      'PROPERTY_531': 'AuxiliaryHydraulics',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Экскаваторы',
      Currency: 'RUB',
      TypeOfVehicle: 'Грузовики и спецтехника',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '107': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_511': 'EngineHours',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_457': 'PowerKW',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_507': 'TruckCraneBoomLength',
      'PROPERTY_509': 'TruckCraneLiftingCapacity',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Автокраны',
      Currency: 'RUB',
      TypeOfVehicle: 'Автокран',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '109': {
    fields: {
      'PROPERTY_435': 'Brand',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_431': 'Color',
      'PROPERTY_433': 'Accident',
      'PROPERTY_453': 'Body',
      'PROPERTY_111': 'VIN',
      'PROPERTY_461': 'OwnersByDocuments',
      'PROPERTY_451': 'DoorsCount',
      'PROPERTY_439': 'Generation',
      'PROPERTY_445': 'EngineType',
      'PROPERTY_455': 'DriveType',
      'PROPERTY_447': 'Transmission',
      'PROPERTY_441': 'Modification',
      'PROPERTY_513': 'ChassisLength',
      'PROPERTY_515': 'CabinHeight',
      'PROPERTY_479': 'CabinType',
      'PROPERTY_443': 'Trim',
      'PROPERTY_487': 'LoadCapacity',
      'PROPERTY_461': 'WheelType',
      'PROPERTY_517': 'NumberOfSeats',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Лёгкий коммерческий транспорт',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '111': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_519': 'ChassisAndBodySameBrand',
      'PROPERTY_521': 'BodyVolume',
      'PROPERTY_453': 'BodyType',
      'PROPERTY_111': 'VIN',
      'PROPERTY_475': 'WheelFormula',
      'PROPERTY_445': 'EngineType',
      'PROPERTY_457': 'Power',
      'PROPERTY_447': 'Transmission',
      'PROPERTY_499': 'EngineCapacity',
      'PROPERTY_477': 'EmissionClass',
      'PROPERTY_501': 'GrossVehicleWeight',
      'PROPERTY_523': 'PermissibleGrossVehicleWeight',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Грузовики',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '111': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'Kilometrage',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_519': 'ChassisAndBodySameBrand',
      'PROPERTY_521': 'BodyVolume',
      'PROPERTY_453': 'BodyType',
      'PROPERTY_111': 'VIN',
      'PROPERTY_475': 'WheelFormula',
      'PROPERTY_445': 'EngineType',
      'PROPERTY_457': 'Power',
      'PROPERTY_447': 'Transmission',
      'PROPERTY_499': 'EngineCapacity',
      'PROPERTY_477': 'EmissionClass',
      'PROPERTY_501': 'GrossVehicleWeight',
      'PROPERTY_523': 'PermissibleGrossVehicleWeight',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Грузовики',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },

  '117': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'EngineHours',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_457': 'PowerKW',
      'PROPERTY_525': 'OperatingWeight',
      'PROPERTY_533': 'ChassisType',
      'PROPERTY_529': 'ExcavatorBucketVolume',
      'PROPERTY_111': 'VIN',
      'PROPERTY_532': 'LoadingBucketVolume',
      'PROPERTY_531': 'AuxiliaryHydraulics',
      'PROPERTY_537': 'DiggingBucketControlType',
      'PROPERTY_491': 'LoaderBucketControlType',
      'PROPERTY_165': 'AvitoId',
    },
    requiredFields: ['Make', 'Model'],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Экскаваторы',
      Currency: 'RUB',
      TypeOfVehicle: 'Экскаватор-погрузчик',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
  '119': {
    fields: {
      'PROPERTY_435': 'Make',
      'PROPERTY_437': 'Model',
      'PROPERTY_183': 'EngineHours',
      'PROPERTY_453': 'TypeOfVehicle',
      'PROPERTY_457': 'Power',
      'PROPERTY_111': 'VIN',
      'PROPERTY_485': 'PriceWithVAT',
      'PROPERTY_469': 'Availability',
      'PROPERTY_471': 'Condition',
      'PROPERTY_473': 'TechnicalPassport',
      'PROPERTY_165': 'AvitoId',      
      'PROPERTY_499': 'EngineCapacity',
      'PROPERTY_539': 'UnderCarriage',
    },
    requiredFields: [],
    defaults: {

      Category: 'Грузовики и спецтехника',
      GoodsType: 'Сельхозтехника',
      Currency: 'RUB',
      ListingFee: ListingFee,
      AvitoStatus: avitostatus,
      CompanyName: companyname
    }
  },
};

// Объединяем общие и специфичные поля
const SECTION_MAPPING = {};
for (const [sectionId, sectionData] of Object.entries(CATEGORY_SPECIFIC)) {
  SECTION_MAPPING[sectionId] = {
    avitoCategory: sectionData.avitoCategory,
    avitoType: sectionData.avitoType,
    fields: { ...COMMON_FIELDS, ...sectionData.fields },
    requiredFields: [...Object.values(COMMON_FIELDS).filter(f =>
      ['Year', 'Managername', 'Contactphone', 'Contactmethod'].includes(f)
    ), ...sectionData.requiredFields],
    defaults: sectionData.defaults || {}
  };
}

export default SECTION_MAPPING;