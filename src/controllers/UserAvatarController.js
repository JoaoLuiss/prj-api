const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class UserAvatarController {
	async update(request, response) {
		const user_id = request.user.id;
		const avatarFilename = request.file.filename;
		const diskStorage = new DiskStorage();

		// valida se o usuário, retornado do midleware de autenticação, existe
		const user = await knex('users').where({ id: user_id });
		if (!user) {
			throw new AppError(
				'Somente usuários autenticados podem mudar o avatar...'
			);
		}

		// se o usuário já possui um avatar, deleta o avatar existente
		if (user.avatar) {
			await diskStorage.deleteFile(user.avatar);
		}

		// salva o novo avatar recebido do request
		const filename = await diskStorage.saveFile(avatarFilename);
		user.avatar = filename;
		await knex('users').update(user).where({ id: user_id });

		return response.json(user);
	}
}

module.exports = UserAvatarController;
