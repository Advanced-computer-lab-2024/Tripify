// models/event.model.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  status: { type: String, default: 'active' },  // Example field
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
