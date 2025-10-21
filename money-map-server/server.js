
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MongoDB connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// --- Schemas ---
// Worked hours
const hoursSchema = new mongoose.Schema({
  hours: Number,
  rate: Number,
  fullDate: String
});
const Hours = mongoose.model('Hours', hoursSchema);

// Income items
const incomeSchema = new mongoose.Schema({
  text: String,
  amount: Number,
  fullDate: String
});
const Income = mongoose.model('Income', incomeSchema);

// Expense items
const lossSchema = new mongoose.Schema({
  text: String,
  amount: Number,
  fullDate: String
});
const Loss = mongoose.model('Loss', lossSchema);

// Payment
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

// --- Routes ---

// Test route
app.get('/', (req, res) => res.send('Money Map Backend running'));

// --- Hours Routes ---
app.post('/hours', async (req, res) => {
  try {
    const newHours = new Hours(req.body);
    await newHours.save();
    res.json(newHours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/hours', async (req, res) => {
  try {
    const hoursList = await Hours.find();
    res.json(hoursList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/hours/:id', async (req, res) => {
  try {
    await Hours.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Income Routes ---
app.post('/income', async (req, res) => {
  try {
    const newIncome = new Income(req.body);
    await newIncome.save();
    res.json(newIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/income', async (req, res) => {
  try {
    const incomeList = await Income.find();
    res.json(incomeList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/income/:id', async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Expense Routes ---
app.post('/loss', async (req, res) => {
  try {
    const newLoss = new Loss(req.body);
    await newLoss.save();
    res.json(newLoss);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/loss', async (req, res) => {
  try {
    const lossList = await Loss.find();
    res.json(lossList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/loss/:id', async (req, res) => {
  try {
    await Loss.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Payment Routes ---
app.post('/payment', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }
    const newPayment = new Payment({ amount });
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/payment', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Totals ---
app.get('/totals', async (req, res) => {
  try {
    const hoursList = await Hours.find();
    const incomeList = await Income.find();
    const lossList = await Loss.find();

    const totalHours = hoursList.reduce((sum, h) => sum + h.hours, 0);
    const totalEarnings = hoursList.reduce((sum, h) => sum + h.hours * h.rate, 0);
    const totalIncome = incomeList.reduce((sum, i) => sum + i.amount, 0);
    const totalLoss = lossList.reduce((sum, l) => sum + l.amount, 0);
    const balance = totalIncome - totalLoss;

    res.json({ totalHours, totalEarnings, totalIncome, totalLoss, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start server ---
app.listen(port, () => console.log(`Server running on port ${port}`));
