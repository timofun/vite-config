import React from 'react';
import { ReactComponent as ReactLogo } from '@assets/react.svg';
import styles from './index.module.scss';
import logoSrc from '@assets/vite.svg';
export function Header() {
  return (
    <div className={styles.header}>
      this is header
      <img src={logoSrc} alt="" />
      <ReactLogo />
      <img
        src={new URL('./logo.png', import.meta.env.VITE_IMG_BASE_URL).href}
      />
    </div>
  );
}
