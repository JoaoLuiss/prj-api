const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite');
const { hash, compare } = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');
const UserCreateService = require('../services/UserCreateService')

class UsersController {
	/** Máximo de 5 funções
	 * index - GET para listar todos os registros
	 * show - GET individual para um único registro
	 * crate - POST criar um único registro
	 * update - PUT para atualizar um único registro
	 * delete - DELETE para remover um único registro
	 */

	async create(request, response) {
		const { name, email, password } = request.body;

		const userRepository = new UserRepository();
		const userCreateService = new UserCreateService(userRepository);
		await userCreateService.execute({ name, email, password });

		return response.status(201).json();
	}

	async update(request, response) {
		const { name, email, password, new_password } = request.body;
		const user_id = request.user.id;

		const database = await sqliteConnection();
		const user = await database.get('SELECT * FROM users WHERE id = (?)', [
			user_id
		]);
		console.log(user);
		if (!user) throw new AppError('Usuário não encontrado');
		const existingUserWithNewEmail = await database.get(
			'SELECT * FROM users WHERE email = (?)',
			[email]
		);
		if (existingUserWithNewEmail && existingUserWithNewEmail.id !== user.id) {
			throw new AppError(
				'Este novo email já está sendo usado por outro usuário.'
			);
		}

		user.name = name ?? user.name;
		user.email = email ?? user.email;

		if (new_password && !password) {
			throw new AppError(
				'Se for trocar de senha, tem que digitar a senha antiga.'
			);
		}
		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			throw new AppError('Senha antiga não confere.');
		}

		user.password = await hash(new_password ?? password, 8);

		await database.run(
			`
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
			[user.name, user.email, user.password, user_id]
		);

		return response.status(200).json();
	}
}

module.exports = UsersController;
