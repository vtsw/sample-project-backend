const awilix = require('awilix');

const { createContainer, InjectionMode } = awilix;

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });
module.exports = container;
