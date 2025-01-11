import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import {createProxyMiddleware} from "http-proxy-middleware";

import foodRouter from './routers/food.router.js';
import userRouter from './routers/user.router.js';
import orderRouter from './routers/order.router.js';
import uploadRouter from './routers/upload.router.js';

import { dbconnect } from './config/database.config.js';
import path, { dirname } from 'path';
dbconnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'],
  })
);

// app.use('/api/solstra', createProxyMiddleware({
//     target: 'https://api-staging.solstra.fi',
//     changeOrigin: true,
//     secure: true,  // Change to false to avoid SSL issues in development
//     pathRewrite: {
//         '^/api/solstra': '/service'
//     },
//     onProxyReq: (proxyReq, req, res) => {
//         // Copy all headers from the original request
//         if (req.headers.authorization) {
//             proxyReq.setHeader('Authorization', req.headers.authorization);
//         }
//         proxyReq.setHeader('x-api-key', 'ee4ede1f-1cf2-4aaa-9826-f9e74cce444e');
//
//         console.log('Proxying request:', {
//             path: proxyReq.path,
//             headers: proxyReq.getHeaders(),
//             method: proxyReq.method
//         });
//     },
//     onError: (err, req, res) => {
//         console.error('Proxy Error Details:', {
//             error: err.message,
//             code: err.code,
//             stack: err.stack
//         });
//         res.status(500).send(err.message);
//     },
//     logLevel: 'debug'  // Add detailed logging
// }));

app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);


const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));

app.get('*', (req, res) => {
  const indexFilePath = path.join(publicFolder, 'index.html');
  res.sendFile(indexFilePath);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});
