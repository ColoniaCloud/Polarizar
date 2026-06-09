'use client';

import { ReactNode } from 'react';

interface CardProps {
  title: string;
  description: string;
  href: string;
}

export default function Card({ title, description, href }: CardProps) {
  return (
    <a
      href={href}
      style={{
        padding: '2rem',
        borderRadius: '12px',
        background: 'white',
        border: '2px solid #e0e0e0',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        display: 'block',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = '#00d4ff';
        el.style.boxShadow = '0 8px 24px rgba(0, 212, 255, 0.15)';
        el.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = '#e0e0e0';
        el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        el.style.transform = 'translateY(0)';
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1a1a2e' }}>{title}</h3>
      <p style={{ margin: 0, color: '#666' }}>{description}</p>
    </a>
  );
}
