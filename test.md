# Add a todo
Invoke-RestMethod -Uri "http://localhost:3000/todos" -Method Post `
  -ContentType "application/json" `
  -Body '{"title":"Buy groceries","status":"backlog","due_date":"2026-07-15"}'

# List all
Invoke-RestMethod -Uri "http://localhost:3000/todos"

# List only in-progress
Invoke-RestMethod -Uri "http://localhost:3000/todos?status=in_progress"

# Change status (backlog -> in_progress -> completed)
Invoke-RestMethod -Uri "http://localhost:3000/todos/1/status" -Method Patch `
  -ContentType "application/json" `
  -Body '{"status":"completed"}'

# Update title
Invoke-RestMethod -Uri "http://localhost:3000/todos/1" -Method Put `
  -ContentType "application/json" `
  -Body '{"title":"Buy groceries and milk"}'

# Delete
Invoke-RestMethod -Uri "http://localhost:3000/todos/1" -Method Delete


# mac

# Add a todo
curl -X POST "http://localhost:3000/todos" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","status":"backlog","due_date":"2026-07-15"}'

# List all
curl "http://localhost:3000/todos"

# List only in-progress
curl "http://localhost:3000/todos?status=in_progress"

# Change status (backlog -> in_progress -> completed)
curl -X PATCH "http://localhost:3000/todos/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Update title
curl -X PUT "http://localhost:3000/todos/1" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries and milk"}'

# Delete
curl -X DELETE "http://localhost:3000/todos/1"