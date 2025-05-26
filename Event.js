import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  description: String,
  recurrence: String,        // 'None', 'Daily', 'Weekly', 'Monthly', 'Custom'
  categoryColor: String,     // Hex code or color name
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;