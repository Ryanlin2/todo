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