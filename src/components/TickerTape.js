// src/components/TickerTape.js
import React, { useEffect, useRef } from 'react';

export default function TickerTape() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';

    const placeholder = document.createElement('div');
    placeholder.className = 'tradingview-widget-container__widget';
    wrapper.appendChild(placeholder);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';

    script.text = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'INDEX:NDX',       title: 'NASDAQ 100' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'NASDAQ:AAPL',     description: 'Apple' },
        { proName: 'NASDAQ:MSFT',     description: 'Microsoft' },
        { proName: 'NASDAQ:NVDA',     description: 'Nvidia' },
        { proName: 'NASDAQ:TSLA',     description: 'Tesla' }
      ],
      showSymbolLogo: true,
      colorTheme: 'light',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en'
    });

    wrapper.appendChild(script);
    container.appendChild(wrapper);

    
    return () => {
      container.removeChild(wrapper);
    };
  }, []);

  return <div ref={ref} className="static-quotes" />;
}
