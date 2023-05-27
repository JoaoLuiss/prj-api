const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class UserAvatarController {
	async update(request, response) {
		const user_id = request.user.id;
		const avatarFilename = request.file.filename;
		const diskStorage = new DiskStorage();

		// valida se o usuário, retornado do midleware de autenticação, existe
		const user = await knex('users').where({ id: user_id }).first();
		if (!user) {
			throw new AppError(
				'Somente usuários autenticados podem mudar o avatar.',
				401
			);
		}

		// se o usuário já possui um avatar, deleta o avatar existente
		if (user.avatar) {
			await diskStorage.deleteFile(user.avatar);
		}

		// salva o novo avatar recebido do request
		const filename = await diskStorage.saveFile(avatarFilename);
		/**
		 * ACIMA o professor rodrigo transmite apenas o FILENAME para dentro da função SAVEFILE...
		 * Isso porque antes da função UserAvatarController.update ser chamada,
		 * o middleware de upload de arquivos (multer) já faz o download do arquivo para a pasta /tmp/.
		 * Por isso é que só é necessário passar o nome do arquivo no parâmetro e não o arquivo em si.
		 * Porque dentro de saveFile() é chamdo o método rename() que transfere o arquivo para a pasta /uploads/
		 */

		user.avatar = filename;
		await knex('users').update(user).where({ id: user_id });

		return response.json(user);
	}
}

module.exports = UserAvatarController;
