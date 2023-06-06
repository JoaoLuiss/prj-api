const UserCreateService = require('./UserCreateService');
const UserRepositoryInMemory = require('../repositories/UserRepositoryInMemory');
const AppError = require('../utils/AppError');

describe('UserCreateService', () => {
	let userRepositoryInMemory = null;
	let userCreateService = null;

	beforeEach(() => {
		userRepositoryInMemory = new UserRepositoryInMemory();
		userCreateService = new UserCreateService(userRepositoryInMemory);
	})

	it('user should be created', async () => {
		const user = {
			name: 'User Test',
			email: 'user@test.com',
			password: '123'
		};

		const usersCreated = await userCreateService.execute(user);
		expect(usersCreated).toHaveProperty('id');
	});

	it('user should not be created with an existing email', async () => {
		const user1 = {
			name: 'John',
			email: 'james@example.com',
			password: '123'
		};
		const user2 = {
			name: 'Johny',
			email: 'james@example.com',
			password: '123'
		};

		await userCreateService.execute(user1);
		await expect(userCreateService.execute(user2)).rejects.toEqual(
			new AppError('Este e-mail já está em uso.')
		);
	});
});
