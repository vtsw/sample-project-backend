const moment = require('moment');

/**
 * @param {number} startTime Unix time stamp
 * @param {number} endTime  Unix time stamp
 * @returns {Array.<String>} format ['YYYY-DD-MM-HH']
 */
const getDateOnDuration = (startTime, endTime) => {
  let dateArray = [], currentDate = moment(startTime), stopDate = moment(endTime);
  while (currentDate <= stopDate) {
    const currentDatePrefix =  moment(currentDate).format('YYYY-MM-DD');
    for(let i = 0; i <= 23; i ++) {
      dateArray.push(currentDatePrefix + '-' + i.toString().padStart(2, '0'));
    }

    currentDate = moment(currentDate).add(1, 'days');
  }
  return dateArray;
};


module.exports = {
  getDateOnDuration
}