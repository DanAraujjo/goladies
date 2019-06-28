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
}

export default new UserController();
