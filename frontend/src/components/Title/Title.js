import React from 'react';

export default function Title({ title, fontSize, margin }) {
  return <h1 style={{ fontSize, margin, color: '#4527a0' }}>{title}</h1>;
}
