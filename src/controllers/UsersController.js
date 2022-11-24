const AppError = require('../utils/AppError');
const sqliteConnection = require('../database/sqlite');
const { hash, compare } = require('bcryptjs');

class UsersController {
	/** Máximo de 5 funções
	 * index - GET para listar todos os registros
	 * show - GET individual para um único registro
	 * crate - POST criar um único registro
	 * update - PUT para atualizar um único registro
	 * delete - DELETE para remover um único registro
	 */

	async create(request, response) {
		// try {
		const { name, email, password } = request.body;
		const database = await sqliteConnection();
		const checkUserExists = await database.get(
			'SELECT * FROM users WHERE email = (?)',
			[email]
		);
		if (checkUserExists) {
			throw new AppError('Este e-mail já está em uso.');
		}
		const hashedPassoword = await hash(password, 8);
		await database.run(
			'INSERT INTO users (name,email,password) VALUES (?, ?, ?) ',
			[name, email, hashedPassoword]
		);

		return response.status(201).json();
		// } catch (error) {
		//   console.error(error);
		//   return response.status(401).json(error);
	}

	async update(request, response) {
		const { newName, newEmail, password, new_password } = request.body;
		const { id } = request.params;
		const database = await sqliteConnection();
		const user = await database.get('SELECT * FROM users WHERE id = (?)', [id]);
		if (!user) throw new AppError('Usuário não encontrado');
		const existingUserWithNewEmail = await database.get(
			'SELECT * FROM users WHERE email = (?)',
			[newEmail]
		);
		console.log(existingUserWithNewEmail);
		if (existingUserWithNewEmail && existingUserWithNewEmail.id !== user.id) {
			throw new AppError(
				'Este novo email já está sendo usado por outro usuário.'
			);
		}

		user.name = newName ?? user.name;
		user.email = newEmail ?? user.email;

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
			[user.name, user.email, user.password, id]
		);

		return response.status(200).json();
	}
}

module.exports = UsersController;
