const sinon = require('sinon');
const awilix = require('awilix');
const { Mutation } = require('../../../../modules/message/graphql/resolver');
const MessageProvider = require('../../../../modules/message/MessageProvider');

const { createContainer, InjectionMode, asValue } = awilix;


const messageMock = require('../../message/message_mock');


describe('createMessage', () => {
  let messageProvider;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    messageProvider = sinon.createStubInstance(MessageProvider, {
      create: sinon.stub(),
    });
    container.register({
      messageProvider: asValue(messageProvider),
    });
  });

  test('Should create message without error.', async () => {
    expect.assertions(1);
    messageProvider.create.resolves(MessageProvider.factory(messageMock[0]));
    const createdMessage = await Mutation.createMessage.resolve({}, { message: {} }, { container, req: { user: {} } });
    expect(createdMessage).toBeTruthy();
  });

  test('Should return created message.', async () => {
    expect.assertions(1);
    messageProvider.create.resolves(MessageProvider.factory(messageMock[0]));
    const createdMessage = await Mutation.createMessage.resolve({}, { message: {} }, { container, req: { user: {} } });
    expect(createdMessage).toEqual(MessageProvider.factory(messageMock[0]));
  });

  test('Should throw error.', async () => {
    expect.assertions(1);
    messageProvider.create.rejects(new Error('fooBar'));
    try {
      await Mutation.createMessage.resolve({}, { message: {} }, { container, req: { user: {} } });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call messageProvider.create with correct params.', async () => {
    expect.assertions(1);
    const message = {
      content: 'sam@sample.com',
    };
    messageProvider.create.resolves(MessageProvider.factory(messageMock[0]));
    await Mutation.createMessage.resolve({}, { message }, { container, req: { user: { id: 'foobar' } } });
    expect(messageProvider.create).toBeCalledOnceWith({
      content: 'sam@sample.com',
      userId: 'foobar',
    });
  });
});

describe('updateMessage', () => {
  let messageProvider;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    messageProvider = sinon.createStubInstance(MessageProvider, {
      update: sinon.stub(),
    });
    container.register({
      messageProvider: asValue(messageProvider),
    });
  });

  afterEach(() => {
    messageProvider = null;
  });

  test('Should update message without error.', async () => {
    expect.assertions(1);
    messageProvider.update.resolves(MessageProvider.factory(messageMock[0]));
    const updatedMessage = await Mutation.updateMessage.resolve({}, { message: { content: 'fooBar' } }, { container });
    expect(updatedMessage).toBeTruthy();
  });

  test('Should return updated message.', async () => {
    expect.assertions(1);
    messageProvider.update.resolves(MessageProvider.factory(messageMock[0]));
    const updatedMessage = await Mutation.updateMessage.resolve({}, { message: { content: 'fooBar' } }, { container });
    expect(updatedMessage).toEqual(MessageProvider.factory(messageMock[0]));
  });

  test('Should throw error when updating is fail.', async () => {
    expect.assertions(1);
    messageProvider.update.rejects(new Error('fooBar'));
    try {
      await Mutation.updateMessage.resolve({}, { message: { content: 'fooBar' } }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call messageProvider.update with correct params.', async () => {
    expect.assertions(1);
    messageProvider.update.resolves(MessageProvider.factory(messageMock[0]));
    await Mutation.updateMessage.resolve({}, { message: { id: 'foobarId', content: 'fooBar' } }, { container });
    expect(messageProvider.update).toBeCalledOnceWith('foobarId', { id: 'foobarId', content: 'fooBar' });
  });
});

describe('deletedMessage', () => {
  let messageProvider;
  let container;
  beforeEach(() => {
    container = createContainer({ injectionMode: InjectionMode.CLASSIC });
    messageProvider = sinon.createStubInstance(MessageProvider, {
      delete: sinon.stub(),
    });
    container.register({
      messageProvider: asValue(messageProvider),
    });
  });

  afterEach(() => {
    messageProvider = null;
  });

  test('Should update message without error.', async () => {
    expect.assertions(1);
    messageProvider.delete.resolves(MessageProvider.factory(messageMock[0]));
    const deletedMessage = await Mutation.deleteMessage({}, { id: 'foobar' }, { container });
    expect(deletedMessage).toBeTruthy();
  });

  test('Should return updated message.', async () => {
    expect.assertions(1);
    messageProvider.delete.resolves(MessageProvider.factory(messageMock[0]));
    const deletedMessage = await Mutation.deleteMessage({}, { id: 'foobar' }, { container });
    expect(deletedMessage).toEqual(MessageProvider.factory(messageMock[0]));
  });

  test('Should throw error.', async () => {
    expect.assertions(1);
    messageProvider.delete.rejects(new Error('fooBar'));
    try {
      await Mutation.deleteMessage({}, { id: 'foobar' }, { container });
    } catch (e) {
      expect(e).toEqual(new Error('fooBar'));
    }
  });

  test('Should call messageProvider.delete with correct params.', async () => {
    expect.assertions(1);
    messageProvider.delete.resolves(MessageProvider.factory(messageMock[0]));
    await Mutation.deleteMessage({}, { id: 'foobar' }, { container });
    expect(messageProvider.delete).toBeCalledOnceWith('foobar');
  });
});
