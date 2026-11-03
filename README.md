# Astra

Dark glass festival website for Samrat Ashok Technological Institute.

Open index.html in your browser, or run:

    python -m http.server 4173

Then visit http://localhost:4173/index.html.

The five pages are independent HTML files. Keep all HTML, CSS and JavaScript files together.

Events is a programme explorer with day-grouped event cards, expandable details,
search by title or venue, combined category/date filters, and reset. The bookmark
button saves events to My picks in the current browser; no account is needed.
Schedule has a navigable calendar. Pick a date to view its event cards; highlighted
dates have events. The Back to festival control returns to November 2026.

## Motion

The footer includes a Motion: Full / Calm button. Full is enabled by default and plays
scroll reveals, rotating planet surfaces, and the planet approach before navigation.
Calm uses a gentle page fade. Your selection is remembered.

The homepage's Find your frequency section stays on screen while scrolling through
Code, Design and Culture. The panels, shapes and waveform move with the scroll
position and reverse as you scroll up. In Calm mode these chapters become static cards.

## Editing

- styles.css: appearance and responsive layout
- events.css: the programme explorer layout
- script.js: filters, schedule tabs, form validation and page transition
- events.html: six sample event cards and their expanded descriptions
- schedule.html: interactive month calendar and daily event board
- events-data.js: shared calendar event data
- register.html: demonstration registration form

Registration only displays local confirmation; it does not send email or save a
registration on a server.

No build process or package installation is needed. Manrope is used throughout with
a system-font fallback when Google Fonts is unavailable.
