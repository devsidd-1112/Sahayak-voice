#!/bin/bash

# Seed Database Script for Sahayak Voice Backend
# This script runs the DatabaseSeeder utility to populate MongoDB with test data

echo "🌱 Starting database seeding..."
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Error: Maven is not installed or not in PATH"
    echo "Please install Maven and try again"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit 1

echo "📦 Building the application..."
mvn clean compile -q

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for compilation errors."
    exit 1
fi

echo "🚀 Running database seeder..."
echo ""

# Run the DatabaseSeeder class
mvn spring-boot:run -Dspring-boot.run.main-class=com.sahayak.voice.util.DatabaseSeeder -q

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeding completed successfully!"
else
    echo ""
    echo "❌ Database seeding failed. Please check the logs above."
    exit 1
fi
