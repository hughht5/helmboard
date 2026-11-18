# Locks: shared things only one session may change at a time

Sessions often share one test database, the same test logins and one browser. Before you
change any of these, take its lock; release it the moment you are done.

- `persona-<name>.lock`: changing a test person's role, permissions, limits or membership.
  Reading as them needs no lock.
- `org-<name>.lock`: changing a test organisation's or workspace's settings.
- `ports.md`: not a lock, a list. Add a line with your card and the ports your dev stack
  uses before you start it; pick ports nobody has listed; remove the line when you stop it.

To take a lock: create the file with your card number, session name and the time, using a
command that fails if the file exists (PowerShell `New-Item -ItemType File` without
`-Force`, or bash `set -o noclobber; echo ... > file`). If it exists, wait and retry every
minute; after 15 minutes tell the Router who holds it. Hold a lock only while the changed
state is needed, put the state back as you found it, then delete the file. Never delete a
lock that is not yours.

## board.html

Any session may edit the board page, one at a time. Take the lock by writing your card number
and session id to `locks/board-html.lock`, and delete the file once you have published. If the
file exists, wait. Each board change is its own card.
