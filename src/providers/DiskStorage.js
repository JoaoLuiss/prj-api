const fs = require('fs')
const path = require('path')
const uploadConfig = require('../configs/upload')

class DiskStorage{
  async saveFile(fileName) {
    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, fileName),
      path.resolve(uploadConfig.UPLOADS_FOLDER, fileName)
    );

    /**
     * Aqui o método saveFile apenas recebe o nome do arquivo.
     * O parâmetro 'file' é apenas uma string com o nome do arquivo.
     * Isso é porque antes do saveFile() ser chamado, nas rotas, há um middleware
     * que usa a lib 'multer' para fazer o download do arquivo para a pasta /tmp/.
     * 
     * Dessa forma, quando o saveFile() é chamado ele só precisa realocar o arquivo da pasta /tmp/
     * para a pasta de destino final, /uploads/,
     * que ele faz com o comando fs.promises.rename(endereco_inicial, endereco_final).
     */

    return fileName;
  }

  async deleteFile(fileName) {
    const filePath = path.resolve(uploadConfig.UPLOADS_FOLDER, fileName);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}


module.exports = DiskStorage;