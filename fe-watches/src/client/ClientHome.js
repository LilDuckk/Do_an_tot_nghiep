import React from 'react';
import Header from './Header';
import Footer from './Footer';
import HomeHero from './HomeHero';
import HotWatches from './HotWatches';
import WatchSuggest from './WatchSuggest';
import { BannerProvider } from './contexts/BannerContext';
import './static/Home.css';

export default function ClientHome() {
  return (
    <div>
      <Header />
      <BannerProvider>
        <HomeHero />
        <HotWatches />
      </BannerProvider>
      <WatchSuggest />
      <Footer />
    </div>
  );
} 