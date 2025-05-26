Event Calendar

A React application featuring a full-featured calendar with event creation, editing, deletion, drag-and-drop rescheduling, and custom recurrence options. Events are stored and managed through a backend API.

Features
•	Add, edit, delete events with details (title, date, time, description).
•	Custom recurrence patterns (None, Daily, Weekly, Monthly, Custom intervals).
•	Drag-and-drop events to reschedule.
•	Conflict detection to avoid overlapping events.
•	Event color customization.
•	Responsive UI with Bootstrap styling.
Prerequisites
•	Node.js (v14 or higher recommended)
•	npm
•	Backend API running locally (e.g., at http://localhost:5000/api/events)
Setup Backend API
This app expects a backend API for event data:
•	API base URL: http://localhost:5000/api/events
•	Supported endpoints:
o	GET /events - fetch all events
o	POST /events - add a new event
o	PUT /events/:id - update an event
o	DELETE /events/:id - delete an event
If you don’t have a backend, you can create one using Node.js + Express + MongoDB or any backend of your choice.
Usage
•	Click any date on the calendar to add a new event.
•	Click an event to edit or delete it.
•	Drag and drop events to reschedule.
•	Choose a color for the event for easy categorization.
•	Set recurrence options, including custom intervals.
Notes
•	Make sure your backend handles the event schema with fields such as title, date, time, description, recurrence, customFrequency, customUnit, and categoryColor.
•	Conflict detection prevents scheduling two events at the same date and time.
•	Custom recurrence is saved but currently handled on the backend or in future enhancements.
Dependencies
•	React
•	FullCalendar React (@fullcalendar/react)
•	FullCalendar plugins: daygrid, timegrid, interaction
•	Axios for API calls
•	Bootstrap 5 for styling


# Event
