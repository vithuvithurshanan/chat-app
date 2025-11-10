# Wolf Chat - WhatsApp-like Features

## Recent Updates

### Users Sidebar
- **Always visible sidebar** on the left showing all users
- **Online/Offline status indicators**:
  - 🟢 Green dot = User is online
  - 🔴 Red dot = User is offline
- **Two sections**:
  - **Recent Chats**: Users you've messaged with (sorted by most recent)
  - **Contacts**: All other users (sorted alphabetically)
- **Search functionality**: Search box to find users quickly
- **Selected user highlight**: Currently selected chat is highlighted

### Features
1. **Real-time presence tracking**: Users' online/offline status updates in real-time
2. **Last message sorting**: Chat list automatically sorts by most recent conversation
3. **User details panel**: Click on user avatar to see detailed profile information
4. **Responsive design**: Sidebar adapts to different screen sizes
5. **Browser notifications**: Get notified when you receive a new message
   - Shows sender's name and message preview
   - Click notification to focus the chat window
   - Auto-closes after 5 seconds

### How it works
- When you send a message, the chat room updates with a timestamp
- Users are automatically separated into two groups:
  - **Recent Chats**: Users with message history (sorted by last message time)
  - **Contacts**: Users without message history (sorted alphabetically by name)
- The most recently active chats appear at the top of the Recent Chats section
- Online status is tracked using Firebase presence system
- When you start a new conversation, that user moves from Contacts to Recent Chats
- **Notifications**:
  - Browser asks for notification permission on first load
  - When a new message arrives from any user, a notification appears
  - Notification shows: "New message from [User Name]" with message preview
  - Click notification to bring chat window to focus
  - Notifications auto-close after 5 seconds

### Technical Implementation
- Uses Firebase Firestore for real-time data sync
- Presence service tracks user online/offline status
- Chat service manages message timestamps and room sorting
- Angular reactive forms for message input
