const moment = require("moment");
const { Op } = require("sequelize");
const { SalesTransaction, ExpensesTransaction } = require("../models");
const logger = require("../utils/logger");

module.exports.getWeeklySummaries = async () => {
  const summaries = [];

  try {
    for (let i = 6; i >= 0; i--) {
      const start = moment().startOf("isoWeek").subtract(i, "weeks");
      const end = moment().endOf("isoWeek").subtract(i, "weeks");

      const startDate = start.format("YYYY-MM-DD");
      const endDate = end.format("YYYY-MM-DD");

      const [salesTotal, expensesTotal] = await Promise.all([
        SalesTransaction.sum("total_price", {
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        }),
        ExpensesTransaction.sum("total_price", {
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
        }),
      ]);

      summaries.push({
        week: `Week of ${start.format("DD-MM")} to ${end.format("DD-MM")}`,
        date: endDate,
        sales_total: parseFloat(salesTotal || 0),
        expenses_total: parseFloat(expensesTotal || 0),
      });

      logger.info(`Summary generated for ${startDate} to ${endDate}: sales=${salesTotal || 0}, expenses=${expensesTotal || 0}`);
    }

    return summaries;
  } catch (error) {
    logger.error(`Failed to generate weekly summaries: ${error.message}`);
    throw new Error("Error generating weekly summaries");
  }
};
