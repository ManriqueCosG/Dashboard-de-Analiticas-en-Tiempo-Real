"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import "./styles.css";

const socket = io("http://localhost:3001");
const COLORS = ["#ffffff", "#00ffcc", "#ffcc00"];

export default function Home() {
  const [cryptoData, setCryptoData] = useState([]);
  const [priceHistory, setPriceHistory] = useState({
    bitcoin: [],
    ripple: [],
    ethereum: [],
    cardano: [],
  });

  useEffect(() => {
    socket.on("updateCrypto", (data) => {
      setCryptoData(data);

      const currentTime = new Date().toLocaleTimeString().slice(0,5);

      setPriceHistory(prev => {
        const newHistory = { ...prev };
        data.forEach(coin => {
          newHistory[coin.id] = [...(newHistory[coin.id] || []), { time: currentTime, price: coin.current_price }];
          if (newHistory[coin.id].length > 10) newHistory[coin.id].shift();
        });
        return newHistory;
      });
    });

    return () => {
      socket.off("updateCrypto");
    };
  }, []);

  return (
    <div className="container">
      <div className="header">Dashboard Cripto</div>

      <select id="cryptos">
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="cardano">Cardano</option>
        <option value="ripple">Ripple</option>
      </select>

      <div className="cards">
        {cryptoData.map((coin) => (
          <div key={coin.id} className="card">
            <div>{coin.name}</div>
            <div className="price">${coin.current_price.toLocaleString()}</div>
            <div className={`change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
              {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
      

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {Object.keys(priceHistory).map((coinId, idx) => (
              <Line
                key={coinId}
                type="monotone"
                data={priceHistory[coinId]}
                dataKey="price"
                name={coinId.charAt(0).toUpperCase() + coinId.slice(1)}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      
    </div>
  );
}
