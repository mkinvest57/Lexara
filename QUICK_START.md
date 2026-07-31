# Quick Start Guide - LingQ Interface

## 🚀 Starting the Application

### 1. Install Dependencies (if not done)
```bash
cd /Users/sashimi/Desktop/Lexara
pnpm install
```

### 2. Start Development Servers
```bash
# Start both API and web app
pnpm run dev
```

This starts:
- **API:** http://localhost:3001
- **Web:** http://localhost:3000

### 3. Access the Application

Open your browser: **http://localhost:3000**

---

## 🎯 Testing the New LingQ Interface

### Test the Reader (Main Feature)

1. **Login/Signup**
   - Go to http://localhost:3000/login
   - Create account or login

2. **Browse Library**
   - Navigate to "Library" (header nav)
   - See lesson cards in 3-column grid
   - Use level filters: All, Beginner, Intermediate, Advanced

3. **Open a Lesson**
   - Click any lesson card
   - **You'll see the 3-column LingQ layout:**
     - Left: (future collapsible sidebar)
     - Center: Readable text with tokenized words
     - Right: Translation panel (360px, sticky)

4. **Click a Word**
   - Click any word in the text
   - **Translation panel appears on the right** with:
     - Word + pronunciation
     - Audio button (speaker icon)
     - Translation input field
     - Popular translations list
     - Connected phrases (dropdown)
     - Notes textarea
     - Status buttons: 1, 2, 3, 4, ✓

5. **Save a Word**
   - Edit the translation if needed
   - Click a status button (1-4 or ✓)
   - **Word turns yellow** in the text
   - Word is saved to vocabulary

6. **Continue Reading**
   - Saved words stay yellow
   - Unknown words show blue hover
   - Click play button (bottom bar) for audio

### Test Flashcards

1. **Go to Review**
   - Click "Review" in navigation
   - See your saved vocabulary count
   - Click "Start Review"

2. **Play Matching Game**
   - **Full-screen modal appears**
   - Green progress bar at top
   - Match terms with translations
   - Click two cards to pair them
   - Matched pairs turn gray
   - Progress updates automatically

3. **Complete or Skip**
   - Click "Passer" to skip
   - Or complete all pairs
   - Modal closes automatically

---

## 🎨 What's Different from Before

### Header
- **NEW:** Orange "PASSEZ EN PREMIUM" button
- **NEW:** Coins counter (43/100 Pièces)
- **NEW:** Language selector with flags
- **NEW:** Notification bell

### Reader Layout
- **BEFORE:** Single column + modal popup
- **NOW:** 3-column layout with persistent translation panel
- **BEFORE:** Translation modal covers text
- **NOW:** Translation panel stays visible while reading

### Word Highlighting
- **BEFORE:** Only blue hover
- **NOW:** 
  - Yellow = saved
  - Light yellow = learning
  - Blue hover = unknown
  - No highlight = known

### Translation Panel
- **BEFORE:** Simple modal
- **NOW:** Full LingQ panel with:
  - Multiple translation suggestions
  - Dictionaries quick links
  - Connected phrases
  - Notes
  - Status levels (1-4-✓)

### Review System
- **BEFORE:** Basic list
- **NOW:** Full-screen matching game with progress

---

## 🖼️ Visual Reference

### Color Palette (Now Implemented)
```css
Orange:      #FFA500  /* Premium button */
Yellow:      #FFE066  /* Saved words */
Yellow Light: #FFF4CC  /* Learning words */
Blue:        #4A9EFF  /* Unknown word hover */
Blue Light:  #E8F4FD  /* Selection background */
```

### Layout Dimensions
```
Header Height:      56px
Sidebar Width:      280px
Translation Panel:  360px
Reader Max Width:   740px
Bottom Bar:         64px
```

---

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Kill existing processes
pkill -f "next dev"
pkill -f "nest start"

# Clean cache
rm -rf apps/web/.next
rm -rf apps/api/dist

# Restart
pnpm run dev
```

### Port Already in Use
```bash
# Check what's using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3002 pnpm run dev
```

### Build Errors
```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
pnpm install

# Build to check errors
pnpm run build
```

### Translation Not Working
- Check API is running: `curl http://localhost:3001/api/health`
- Check browser console for errors
- Verify you're logged in (check session)

---

## 📝 Common Tasks

### Add New Lesson
1. Go to Library
2. Click "Import Content" button
3. (Future: Import dialog will open)

### Check Vocabulary
1. Go to "Stats" or "vocab" page
2. See all saved words
3. Filter by level/status

### Change Language
1. Click flag in header
2. Select language from dropdown
3. (Future: Will reload lessons for that language)

---

## 🎓 User Flow Example

```
1. User opens app
   ↓
2. Logs in
   ↓
3. Goes to Library
   ↓
4. Clicks "Beginner" filter
   ↓
5. Clicks a lesson card
   ↓
6. Reader opens (3-column layout)
   ↓
7. Clicks unknown word "你好"
   ↓
8. Translation panel shows "hello"
   ↓
9. User adds note "common greeting"
   ↓
10. Clicks status "1" (new word)
    ↓
11. Word turns yellow
    ↓
12. Continues reading...
    ↓
13. Later: Goes to Review
    ↓
14. Plays matching game
    ↓
15. Matches "你好" with "hello"
    ↓
16. Progress: 1/10 completed
```

---

## 🎉 You're Ready!

The LingQ interface is now fully implemented and ready to use.

**Main URLs:**
- App: http://localhost:3000
- API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs (if Swagger enabled)

**Next Steps:**
1. Test the reader with real lessons
2. Save some vocabulary
3. Try the review system
4. Check the implementation summary for technical details

Enjoy your new LingQ-style language learning interface! 🚀
