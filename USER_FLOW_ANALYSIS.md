# User Flow Analysis & Proposal

## Current State Analysis

### Tab Structure

**Desktop (4 tabs):**
1. **Inbox** - Tasks with no due date, not completed
2. **Today** - Tasks with due date ≤ today, not completed
3. **Future** (Upcoming) - Tasks with due date > today, not completed
4. **Archive** (Completed) - All completed tasks

**Mobile (3 tabs):**
1. **Today** - Tasks with due date ≤ today, not completed
2. **Inbox** - Tasks with no due date, not completed
3. **Future** (Upcoming) - Tasks with due date > today, not completed
4. ~~Archive~~ - **MISSING** on mobile

### Current User Flow

#### Task Creation Flow
1. User creates a task
2. Task goes to **Inbox** if no due date is set
3. Task goes to **Today** if due date ≤ today
4. Task goes to **Future** if due date > today

#### Task Completion Flow
1. User checks off a task as complete
2. Task **immediately disappears** from current view (Today/Inbox/Future)
3. Task moves to **Archive** (only accessible on desktop)
4. User loses visual feedback of accomplishment

#### Task Navigation Flow
- Desktop: 4 tabs to switch between
- Mobile: 3 tabs + no archive access
- To see completed tasks: Navigate to Archive (desktop only)

---

## Identified Problems

### 1. **Vanishing Task Problem**
**Issue:** When you complete a task in "Today" view, it immediately disappears.

**Impact:**
- No sense of accomplishment
- Can't review what you just completed
- Hard to track progress throughout the day
- If you complete a task by accident, it's gone from view

**User Pain Point:** "I finished 5 tasks today but I can't see them anymore unless I navigate to Archive"

### 2. **Cognitive Load Issue**
**Issue:** Users must remember which view each task belongs to based on due dates.

**Impact:**
- Mental overhead: "Did I set a due date on that task?"
- Fragmented task lists across multiple views
- Context switching between tabs to find tasks

**User Pain Point:** "Where did that task go? Was it in Inbox or Today?"

### 3. **Mobile Archive Gap**
**Issue:** Completed tasks are completely inaccessible on mobile.

**Impact:**
- No way to review completed work on mobile
- Can't undo accidental completions
- Inconsistent experience between desktop and mobile
- Breaks GTD workflow on mobile

**User Pain Point:** "I accidentally completed a task on my phone and now I can't get it back"

### 4. **Inbox Paradox**
**Issue:** Keeping inbox empty is good GTD practice, but makes it hard to track what you've organized.

**Impact:**
- Empty inbox feels unproductive
- No history of organizing behavior
- Can't see patterns in task creation

### 5. **Today View Limitation**
**Issue:** Only shows incomplete tasks, resets daily.

**Impact:**
- Daily accomplishments disappear
- No end-of-day summary
- Can't see overdue tasks vs today's tasks clearly

---

## Proposed Solutions

### Option A: **Keep Completed Tasks Visible (Recommended)**

**Change the "Today" view to show:**
- Incomplete tasks at the top
- Completed tasks below (grayed out, with checkmarks)
- Clear visual separation between the two groups

**Benefits:**
- ✅ Sense of accomplishment throughout the day
- ✅ Easy to undo accidental completions
- ✅ Visual progress tracking
- ✅ Minimal code changes
- ✅ Works well with existing architecture

**Implementation:**
- Modify `getTodos()` query to include completed tasks for "today" filter
- Update UI to visually separate completed/incomplete
- Add "Clear completed" action (optional)

**Similar to:** Todoist, Microsoft To Do, Things 3

---

### Option B: **Add a "Done Today" Section**

**Add a collapsible section** in Today view that shows completed tasks.

**Benefits:**
- ✅ Keeps incomplete tasks clean
- ✅ Completed tasks available on-demand
- ✅ Less visual clutter
- ⚠️ Requires more UI changes

---

### Option C: **Unified "All Tasks" View**

**Replace multiple views with:**
- **All Tasks** - Shows everything with smart grouping:
  - Overdue (red)
  - Today (default)
  - Tomorrow
  - This Week
  - Later
  - No Date (Inbox)
  - Completed (collapsible)

**Benefits:**
- ✅ Single source of truth
- ✅ No cognitive overhead about which view
- ✅ Natural flow from urgent to later
- ⚠️ Major architectural change
- ⚠️ Might be overwhelming for some users

---

### Option D: **Status-Based Filtering**

**Keep current views but add status filter:**
- Default: Show incomplete only
- Toggle: Show all (completed + incomplete)
- Per-view setting

**Benefits:**
- ✅ Flexible for different workflows
- ✅ Doesn't force a single approach
- ⚠️ Adds complexity

---

## Recommended Approach: **Option A + Mobile Archive**

### Phase 1: Show Completed Tasks in Views
1. **Modify Today view** to show completed tasks from today
2. **Modify Inbox view** to optionally show recently completed inbox items
3. **Modify Future view** to show completed tasks with future dates
4. Add visual distinction (grayed out, strike-through)
5. Add "Clear completed" or "Hide completed" toggle (optional)

### Phase 2: Mobile Archive Access
1. Add Archive tab to mobile bottom bar (5 tabs)
2. OR add Archive as a menu item in the "You" popover
3. Ensure consistency with desktop experience

### Phase 3: Enhanced Features (Optional)
1. Daily summary view ("You completed X tasks today")
2. Undo completion action (temporary)
3. Batch operations on completed tasks
4. Filter to show/hide completed per view

---

## Implementation Plan

### Minimal Changes Required

#### 1. Database Query Changes
**File:** `lib/db/queries/todos.ts`

**Change the filter logic:**
```typescript
// Current: only incomplete
eq(todosTable.isCompleted, false)

// New: show completed tasks from the same period
// For "today": show tasks due today regardless of completion
// For "inbox": show recently completed (last 7 days?)
// For "completed": keep as-is (all completed)
```

#### 2. UI Updates
**File:** `components/todos/todo-list.tsx`

**Group tasks by completion status:**
- Show incomplete tasks first
- Then completed tasks (visually distinct)
- Optional: collapsible completed section

#### 3. Mobile Bottom Bar
**File:** `components/mobile-bottom-bar/index.tsx`

**Option 1:** Add 5th tab for Archive
**Option 2:** Move Archive to User menu popover

#### 4. Sidebar Consistency
**File:** `components/sidebar/index.tsx`

**Ensure both mobile and desktop have same access to Archive**

---

## User Flow After Changes

### Improved Task Completion Flow
1. User checks off a task
2. Task remains visible but grayed out
3. Task moves to "Completed" section (within the same view)
4. User sees immediate feedback of progress
5. Can still access Archive for historical view

### Benefits
- ✅ Sense of accomplishment preserved
- ✅ Easy error recovery
- ✅ Better mobile experience
- ✅ Consistent cross-platform
- ✅ Minimal code changes
- ✅ Maintains existing mental model

---

## Alternative Considerations

### GTD Workflow Alignment
The current system tries to follow GTD (Getting Things Done):
- Inbox = capture
- Today = next actions
- Future = scheduled
- Archive = reference

**However,** traditional GTD doesn't hide completed tasks immediately—it reviews them periodically.

### Other Todo Apps Analysis

| App | Behavior | Pros |
|-----|----------|------|
| Todoist | Shows completed in same view | ✅ Accomplishment visible |
| Things 3 | "Logbook" view | ✅ Dedicated history |
| Microsoft To Do | "Completed" section | ✅ Keeps main list clean |
| Apple Reminders | Shows completed in list | ✅ Simple, predictable |
| Asana | Tasks stay in list | ✅ Full context |

**Pattern:** Most successful todo apps keep completed tasks visible in context.

---

## Metrics to Consider

After implementation, track:
- Task completion rate
- Time spent in each view
- Undo/uncheck frequency
- Mobile vs desktop usage patterns
- User feedback on "sense of accomplishment"

---

## Next Steps

1. **Review this analysis** - Do the identified problems resonate?
2. **Choose a solution** - Which option fits your workflow best?
3. **Prioritize implementation** - Phase 1 (core) vs Phase 2 (mobile) vs Phase 3 (enhancements)
4. **Validate with usage** - Try the changes, iterate based on real use

---

## Questions to Answer

Before implementation:
- Should completed tasks stay visible forever, or for a limited time (e.g., 24 hours)?
- Should there be a "Clear completed" button?
- Should each view have independent show/hide completed settings?
- Should mobile have Archive as a 5th tab or in the menu?
- Should we show a count of completed tasks in each view?

---

## Technical Considerations

### Database Impact
- Query changes are minimal (remove `isCompleted = false` filter)
- May increase query result size slightly
- Sorting logic remains the same (completed tasks sort to bottom)

### Performance Impact
- Negligible - most users don't have thousands of completed tasks in a single day
- Could add pagination if needed
- Could cache completed tasks separately

### Offline Behavior
- No impact on offline functionality
- Works with existing Tanstack Query caching
- Service worker caching unaffected

### Migration
- No database schema changes needed
- No data migration required
- Backward compatible

---

## Conclusion

The current system has a solid foundation but suffers from the "vanishing task" problem that hurts user satisfaction and workflow efficiency. 

**Recommended next step:** Implement **Option A** (keep completed tasks visible) starting with the Today view, which is the most frequently used view. This provides immediate value with minimal risk.

This change:
- Aligns with industry best practices
- Addresses the core user pain point
- Requires minimal code changes
- Maintains the existing mental model
- Can be easily reverted if needed

The mobile Archive access can be addressed in a follow-up phase after validating the approach works well on desktop.
