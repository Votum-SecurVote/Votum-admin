#!/bin/bash
# Run Spring Boot backend with environment variables

export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=vote_admin
export PGUSER=postgres
export PGPASSWORD=mypassword123
export JWT_SECRET=dev_jwt_secret_123
export PORT=5000

echo "Starting Spring Boot backend..."
echo "PostgreSQL: $PGHOST:$PGPORT/$PGDATABASE"
echo "Port: $PORT"

mvn spring-boot:run
