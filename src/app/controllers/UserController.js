import User from '../models/User';

class UserController {
  async store(req, res) {
    const emailExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (emailExists) {
      return res.status(400).json({
        message: 'Já existe um usuário cadastrado com esse e-email.',
      });
    }

    const { id } = await User.create(req.body);

    return res.status(201).json({ id });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const emailExists = await User.findOne({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          message: 'Já existe um usuário cadastrado com esse e-email.',
        });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senhá inválida!' });
    }

    await user.update(req.body);

    return res.json({ message: 'Usuário atualizado!' });
  }
}

export default new UserController();
