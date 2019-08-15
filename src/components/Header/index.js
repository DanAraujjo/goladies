import React from 'react';
import { Link } from 'react-router-dom';

import Notifications from '~/components/Notifications';
import logo from '~/assets/logo-purple.svg';

import { Container, Content, Profile } from './styles';

export default function Header() {
  return (
    <Container>
      <Content>
        <nav>
          <img src={logo} alt="GoLadies" />
          <Link to="/dashboard">DASHBOARD</Link>
        </nav>

        <aside>
          <Notifications />

          <Profile>
            <div>
              <strong>Daniel Araujo</strong>
              <Link to="/profile">Meu perfil</Link>
            </div>
            <img
              src="https://avatars2.githubusercontent.com/u/25941698?s=460&v=4"
              alt="Daniel Araujo"
            />
          </Profile>
        </aside>
      </Content>
    </Container>
  );
}
