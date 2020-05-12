const { asClass } = require('awilix');
const fetch = require('node-fetch');
const ServiceProvider = require('../../ServiceProvider');
const ReservationProvider = require('../reservation/ReservationProvider');
const ReservationTemplateProvider  = require('../reservation/ReservationTemplateProvider');
const ReservationRequestHistoryProvider = require('../reservation/ReservationRequestHistoryProvider');
class ReservationServiceProvider extends ServiceProvider {
  register() {
    this.container.register('reservationProvider', asClass(ReservationProvider)
      .inject((injectedContainer) => ({ reservation: injectedContainer.resolve('db').collection('reservation') }))
      .singleton());
    this.container.register('reservationTemplateProvider', asClass(ReservationTemplateProvider)
      .inject((injectedContainer) => ({ reservationTemplate: injectedContainer.resolve('db').collection('reservationTemplate') }))
      .singleton());
    this.container.register('reservationRequestHistoryProvider', asClass(ReservationRequestHistoryProvider)
      .inject((injectedContainer) => ({ reservationRequestHistory: injectedContainer.resolve('db').collection('reservationRequestHistory') }))
      .singleton());
  }

  async boot() {
    
  }
}

module.exports = ReservationServiceProvider;
