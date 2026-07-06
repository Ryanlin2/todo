bucket         = "REPLACE_ME-todo-app-tfstate"
key            = "todo-app/staging/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "todo-app-tf-locks"
encrypt        = true
