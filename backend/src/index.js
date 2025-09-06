const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Crypto funcionando" });
});

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Función para consultar CoinGecko
async function fetchCryptoData() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          ids: "bitcoin,ethereum,cardano",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    return [];
  }
}

// Enviar datos cada 10 segundos
setInterval(async () => {
  const cryptoData = await fetchCryptoData();
  io.emit("updateCrypto", cryptoData);
}, 10000);

server.listen(3001, () => {
  console.log("Servidor backend corriendo en http://localhost:3001");
});
