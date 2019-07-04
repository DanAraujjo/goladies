import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.finddAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async strore(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou!' });
    }

    const { provider_id, date } = req.body;

    /* Verifica se provider_id pretece a um fornecedor */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'Você só pode criar agendamento com fornecedores.' });
    }

    /* verifica se usuario é o mesmo fornecedor */
    if (req.userId === provider_id) {
      return res
        .status(401)
        .json({ error: 'Você não pode fazer um agendamento para você mesmo.' });
    }

    /* verificar se a data informada é maior que a data atual */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'Não é permitido agendamento para data/hora passada.',
      });
    }

    /* Verificar se o horario está disponível */
    const checkNotAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkNotAvailability) {
      return res.status(400).json({
        error: 'Horário indisponível!',
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /**
     *  Envia notificação para o fornecedor
     */
    const user = await User.findByPk(req.userId);

    /* formata a data */
    const formattedDate = format(hourStart, "dd 'de' MMMM', às' HH:mm'h'", {
      locale: ptBR,
    });

    /* envia a notificação */
    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}.`,
      user: provider_id,
    });

    return res.status(201).json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, canceled_at: null, user_id: req.userId },
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      return res.status(400).json({ error: 'Nenhum agendamento encontrado!' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'Só é possível cancelar agendamentos duas horas antes!',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    // envio de email
    await Queue.add(CancellationMail.key, { appointment });

    return res.json(appointment);
  }
}

export default new AppointmentController();
