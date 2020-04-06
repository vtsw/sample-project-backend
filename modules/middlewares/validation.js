module.exports = {
  /**
   *
   * @param resolve
   * @param parent
   * @param args
   * @param context
   * @param info
   * @returns {Promise<*>}
   * @constructor
   */
  Mutation: async (resolve, parent, args, context, info) => {
    const mutationField = info.schema.getMutationType();
    const mutationDefinition = mutationField.getFields()[info.fieldName];
    const mutationValidationSchema = mutationDefinition.validationSchema;
    if (mutationValidationSchema) {
      await mutationValidationSchema.validateAsync(args);
    }
    return resolve(parent, args, context, info);
  },
};
