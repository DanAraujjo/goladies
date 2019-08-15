import React from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import api from '~/services/api';

import { Container, Time } from './styles';

export default function Dashboard() {
  return (
    <Container>
      <header>
        <button type="button">
          <MdChevronLeft size={36} color="#fff" />
        </button>
        <strong>15 de Agosto</strong>
        <button type="button">
          <MdChevronRight size={36} color="#fff" />
        </button>
      </header>

      <ul>
        <Time past>
          <strong>07:00</strong>
          <span>Marta</span>
        </Time>
        <Time>
          <strong>08:00</strong>
          <span>Maria</span>
        </Time>
        <Time available>
          <strong>09:00</strong>
          <span>Em abero</span>
        </Time>
        <Time>
          <strong>10:00</strong>
          <span>Michele</span>
        </Time>
      </ul>
    </Container>
  );
}
