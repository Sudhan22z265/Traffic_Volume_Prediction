const { HolidayAPI } = require('holidayapi');
const key = '6a27687b-8c0a-4314-a13a-9a126370d81c'
const holidayApi = new HolidayAPI({ key });
holidayApi.holidays({
  country: 'IN',
  year: '2024',
});