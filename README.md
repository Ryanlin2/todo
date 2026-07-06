# 1 Backend Initialization.

Created a sqlite database to "mock" endpoints that I will be using for my todo list.

Stored start and test functions in package.json and tested the invocation of endoints of sqlite server.

# 2 Branching Model

Chose to follow Github flow branching model.

main -> create feature brnach -> commit -> commit -> open PR -> review -> merge to main -> deploy

# 3 Containerization

Created Dockerfile to contain the application and run application.

```
 docker build -t todo-app .
```

```
docker run -p 3000:3000 --name todo-app-container todo-app
```

# 3 Continuous Integration

Added tests that are triggered on push to github.
