---
name: tell-router
description: Hand a task from this session to the owner's Router session, so the Router makes the card and gets it built. Use when the owner says "tell the router", "give this to the router", "have the router start this", "send it to the router", or "/tell-router".
---

# Tell the Router

The owner has worked something out with you and wants the Router to take it from here.

1. **Find the Router.** Read `<ROUTER_DIR>/router.json` for its session
   id. Check it is still running (`mcp__ccd_session_mgmt__list_sessions`). If the file is
   missing or that session is gone, tell the owner "the Router isn't running; start a session
   and run /router" and stop. Never start a Router yourself.
2. **Write a complete brief.** The Router has none of this conversation. In your own
   words: the goal, the repo and files or area, what was decided here and why, what was
   ruled out, the done-when checks, and anything the owner said about how far it goes (plan
   first, stop for review, all the way). Quote his exact words for that last part.
3. **Send it** to that session id (`mcp__ccd_session_mgmt__send_message`, or
   `SendMessage` with `to` set to the id). Start the message with
   `Task from session "<this session's title>" for the owner:`.
4. **Tell the owner** it was sent and, when the Router replies, the card number. The Router
   confirms with him directly before it skips a review or ships anything.

One task per message. Don't send secrets, tokens or sign-in links.
