import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [form, setForm] = useState({
    id: '',
    title: '',
    date: '',
    time: '',
    description: '',
    recurrence: 'None',
    customFrequency: '',
    customUnit: 'Day(s)',
    categoryColor: '#004D40',
  });

  // Fetch events from backend
  async function fetchEvents() {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Open add event modal
  function openAddModal(selectedDate) {
    setForm({
      id: '',
      title: '',
      date: selectedDate || '',
      time: '',
      description: '',
      recurrence: 'None',
      customFrequency: '',
      customUnit: 'Day(s)',
      categoryColor: '#004D40',
    });
    setModalMode('add');
    setModalOpen(true);
  }

  // Open edit modal with event data
  function editEvent(event) {
    setForm({
      id: event._id,
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      recurrence: event.recurrence || 'None',
      customFrequency: event.customFrequency || '',
      customUnit: event.customUnit || 'Day(s)',
      categoryColor: event.categoryColor ? event.categoryColor : '#004D40',
    });
    setModalMode('edit');
    setModalOpen(true);
  }

  // Close modal
  function closeModal() {
    setModalOpen(false);
  }

  // Handle form input changes
  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Defensive conflict check function
  function hasConflict(id, date, time) {
    return events.some(ev => {
      if (ev._id === id) return false;

      let evDate, evTime;

      // Defensive parsing of startStr or fallback
      if (ev.startStr) {
        const parts = ev.startStr.split('T');
        evDate = parts[0];
        evTime = parts[1] ? parts[1].slice(0, 5) : '';
      } else if (ev.date && ev.time) {
        evDate = ev.date;
        evTime = ev.time;
      } else if (ev.start) {
        // if ev.start is Date object
        if (typeof ev.start === 'string') {
          const parts = ev.start.split('T');
          evDate = parts[0];
          evTime = parts[1] ? parts[1].slice(0, 5) : '';
        } else if (ev.start instanceof Date) {
          evDate = ev.start.toISOString().split('T')[0];
          evTime = ev.start.toISOString().split('T')[1].slice(0, 5);
        }
      } else {
        // If no date/time info, skip
        return false;
      }

      return evDate === date && evTime === time;
    });
  }

  // Submit add or edit form
  async function handleSubmit(e) {
    e.preventDefault();

    // Conflict check
    if (hasConflict(form.id, form.date, form.time)) {
      alert('Time conflict with another event.');
      return;
    }

    try {
      if (modalMode === 'add') {
        await axios.post('http://localhost:5000/api/events', form);
      } else {
        await axios.put(`http://localhost:5000/api/events/${form.id}`, form);
      }
      fetchEvents();
      closeModal();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Error saving event.');
    }
  }

  // Delete event
  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      fetchEvents();
      closeModal();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Error deleting event.');
    }
  }

  // Handle date click to add event
  function handleDateClick(info) {
    openAddModal(info.dateStr);
  }

  // Handle event click to edit event
  function handleEventClick(info) {
    // Find event in state by id
    const ev = events.find(e => e._id === info.event.id);
    if (ev) editEvent(ev);
  }

  // Handle drag and drop event reschedule
  async function handleEventDrop(info) {
    const id = info.event.id;
    const newDate = info.event.startStr.split('T')[0];
    const newTime = info.event.startStr.split('T')[1].slice(0, 5);

    if (hasConflict(id, newDate, newTime)) {
      alert('Conflict detected! Cannot move event.');
      info.revert();
      return;
    }

    try {
      // Find existing event to keep data consistent
      const ev = events.find(e => e._id === id);
      if (!ev) throw new Error('Event not found');

      const updatedEvent = {
        ...ev,
        date: newDate,
        time: newTime,
      };

      await axios.put(`http://localhost:5000/api/events/${id}`, updatedEvent);
      fetchEvents();
    } catch (err) {
      console.error('Error updating event after drop:', err);
      alert('Error updating event.');
      info.revert();
    }
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">Event Calendar</h1>
      <button className="btn btn-primary mb-3" onClick={() => openAddModal()}>
        Add Event
      </button>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map(ev => ({
          id: ev._id,
          title: ev.title,
          start: `${ev.date}T${ev.time}`,
          color: ev.categoryColor || '#004D40',
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={true}
        eventDrop={handleEventDrop}
        selectable={true}
      />

      <h3 className="mt-4 mb-3">Your Events</h3>
      <div>
        {events.map(event => (
          <div
            key={event._id}
            className="event-container"
            style={{ borderLeft: `8px solid ${event.categoryColor || '#004D40'}` }}
          >
            <h5 className="event-title">{event.title}</h5>
            <p className="event-details">{event.date} {event.time}</p>
            <p className="event-details">{event.description}</p>
            <p className="event-recurrence"><strong>Recurrence:</strong> {event.recurrence}</p>
            <button
              onClick={() => editEvent(event)}
              className="btn btn-sm btn-warning btn-custom"
            >
              Edit
            </button>&nbsp;&nbsp;
            <button
              onClick={() => handleDelete(event._id)}
              className="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{modalMode === 'add' ? 'Add Event' : 'Edit Event'}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    required
                    name="title"
                    className="form-control"
                    value={form.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3 row">
                  <div className="col">
                    <label className="form-label">Date</label>
                    <input
                      required
                      type="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">Time</label>
                    <input
                      required
                      type="time"
                      name="time"
                      className="form-control"
                      value={form.time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={form.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Recurrence</label>
                  <select
                    name="recurrence"
                    className="form-select"
                    value={form.recurrence}
                    onChange={handleInputChange}
                  >
                    <option>None</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Custom</option>
                  </select>
                </div>

                {form.recurrence === 'Custom' && (
                  <div className="mb-3 row">
                    <div className="col-6">
                      <input
                        type="number"
                        name="customFrequency"
                        className="form-control"
                        placeholder="Repeat every ..."
                        min="1"
                        value={form.customFrequency}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-6">
                      <select
                        name="customUnit"
                        className="form-select"
                        value={form.customUnit}
                        onChange={handleInputChange}
                      >
                        <option>Day(s)</option>
                        <option>Week(s)</option>
                        <option>Month(s)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Category Color</label>
                  <input
                    type="color"
                    name="categoryColor"
                    className="form-control form-control-color"
                    value={form.categoryColor}
                    onChange={handleInputChange}
                    title="Choose event color"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Event' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
