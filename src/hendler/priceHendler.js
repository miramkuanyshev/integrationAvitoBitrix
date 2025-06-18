export default class PriceReductionCalculator {
  constructor(config) {
    this.config = config.reduction;
  }

  calculateReductionsCount(estimateDate) {
    if (!estimateDate) return 0;
    
    const today = new Date();
    const estimateDateObj = new Date(estimateDate);
    const timeDiff = today.getTime() - estimateDateObj.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    return Math.min(
      Math.floor(daysDiff / this.config.daysBetweenReductions),
      this.config.maxReductions
    );
  }

  calculateNewPrice(actualEstimate, reductions) {
    let newPrice = actualEstimate;
    
    for (let i = 0; i < reductions; i++) {
      const reductionPercent = i < this.config.maxReductions - 1 
        ? this.config.initialPercent 
        : this.config.finalPercent;
      
      newPrice = newPrice * (1 - reductionPercent / 100);
    }
    
    return newPrice;
  }

  getNextReductionDate(estimateDate, reductions) {
    const nextDate = new Date(estimateDate);
    nextDate.setDate(nextDate.getDate() + (reductions + 1) * this.config.daysBetweenReductions);
    return nextDate;
  }
}