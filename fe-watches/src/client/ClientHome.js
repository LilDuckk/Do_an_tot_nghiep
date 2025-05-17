import React from 'react';
import Header from './Header';
import Footer from './Footer';
import HomeHero from './HomeHero';
import HotWatches from './HotWatches';
import WatchSuggest from './WatchSuggest';
import './static/Home.css';

export default function ClientHome() {
  return (
    <div>
      <Header />
      <HomeHero />
      <HotWatches />
      <WatchSuggest />
      <Footer />
    </div>
  );
} 