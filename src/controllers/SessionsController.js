const { compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');

const knex = require('../database/knex');
const AppError = require('..//utils/AppError');
const authConfig = require('../configs/auth');

class SessionsController {
	async create(request, response) {
		const { email, password } = request.body;

		const user = await knex('users').where({ email }).first();

		// validando se o usuário existe
		if (!user) {
			throw new AppError('Email incorreto.', 401);
		}

		// validando a senha
		const passwordMatched = await compare(password, user.password);
		if (!passwordMatched) {
			throw new AppError('Senha incorreta.');
		}

		const { secret, expiresIn } = authConfig.jwt;
		const token = sign({}, secret, {
			subject: String(user.id),
			expiresIn
		});

		return response.json({ user, token });
	}
}

module.exports = { SessionsController };
