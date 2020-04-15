

module.exports = {
  Query: {
    customer:  (_, { id }, { container }) => container.resolve('customerProvider').create(id, container),
    // customer: (() => "asdasd"),
  },
};
