import React from 'react';
import { Link } from 'react-router-dom';
import './JobLink.css';

export default function Title() {
  return (
    <div>
      <h1>
        <Link to="/">
        
          JobLink
        </Link>
      </h1>
    </div>
  );
}
