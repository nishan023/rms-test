import express from "express";
const app = express();


import authRoutes from './routes/auth.router.js';



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);





app.get('/', (req, res) => {
  res.status(200).json({
    message: "API is running"
  });
});

export default app;