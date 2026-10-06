'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '../../components/auth/LoginPage';
import { User } from '../../lib/types';

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = (user: User) => {
    if (user.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/manager');
    }
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
