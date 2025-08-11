# Dashboard plan

- Everything protected lives under /dashboard with its own layout.
- Layout: sidebar nav + shared header + an outlet for each page.
- Pages: overview, orders, order detail, gigs, gig editor,
  messages, notifications, wishlist and settings.
- Order statuses: pending, in_progress, delivered, completed,
  cancelled, revision, disputed.
- The seller and buyer see slightly different views of the same pages.
- Keep page state local until two pages share it, then hoist it into a slice.
- The chat slice holds conversations and the active thread.
- GigDetail exports a Modal component the dashboard modals reuse.
- Status colours live in utils/format so every page agrees.
- The layout is a drawer on mobile and a fixed sidebar on desktop.
- Tested every status transition from both buyer and seller sides.
- Deleting a gig asks for confirmation before removing it.
- Notifications mark read on click and clear the unread count.
- The gig editor is the most complex form in the app so far.
